blog_heading: Django on Azure - beyond "hello world"
blog_subheading: A tutorial on deploying a production-reading Django application on Microsoft Azure
blog_header_image: home-bg.jpg
blog_author: Anthony Shaw
blog_publish_date: April 13, 2020
---------------------------------

In this tutorial I'm assuming that you have written, or are writing a Python web application that uses Django and you want to deploy that application onto Microsoft Azure.

I'm not going to cover how to create, or write a Django application, but instead we're going to focus on the _last mile_ of development- getting it into production.

In this tutorial, we will cover:

* [How to set up your development environment for reproducability](#setting-up-requirements)
* [How to use Azure Postgres services for the Django database](#database)
* How to test your application locally and on CI/CD
* How to use Azure Storage to host your static and media files
* (Optionally) Integrating Django Auth with Azure Active Directory
* How to harden the security of your development and runtime environments
* How to test the performance of your application and fine tune it
* How to setup error monitoring and performance metrics in Azure Application Insights

The code for this tutorial is up on [my GitHub](https://github.com/tonybaloney/django-on-azure-demo).

## Setting up your requirements {#setting-up-requirements}

A common developer workflow is to create a local virtual environment, install the dependencies and tools needed for running the application, testing it, and linting it into the same
virtual environment, and then running `pip freeze > requirements.txt` to save the state of the environment so that it is reproducable.

Something really important to note, is that the Azure deployment script will automatically install your PyPi requirements listed in `requirements.txt` onto the container **each** time it is deployed.

For that reason, I recommend that you put additional planning into **separating the requirements of your virtual environments**. I recommend **not** to have a single `requirements.txt` file, because:

* You are deploying packages into the environment of the production image that are not required
* You are more likely to hit packaging version conflicts
* You are more likely to to have security holes by deploying more packages onto production

Instead, I recommend either to use an environment manager, or to keep your requirements separate between runtime, development and testing.

These are the 3 sets of package requirements I would setup instead:

1. `requirements.txt` - the runtime requirements for production and staging environments
2. `requirements-dev.txt` - the additional requirements for
3. `requirements-test.txt` - any testing tools and libraries

For example, your runtime requirements should be pinned to the specific version of Django and your extensions that you require:

**`requirements.txt`**
```default
django==3.0.4
django-storages[azure]==1.9.1
psycopg2-binary==2.8.4
```

Your development requirements should include that **and** the linters, etc. that you need:

**`requirements-dev.txt`**
```default
-rrequirements.txt
black
flake8
```

Your test requirements should include the runtime requirements and the test runner. If you're using Pytest and tox, that would be:

**`requirements-test.txt`**
```default
-rrequirements.txt
pytest
pytest-django
pytest-cov
tox
```

## Web Application

| Service                              | Configuration Area                                | Setting                               | Recommended Value           | Purpose                                                            | Link                                            |
|--------------------------------------|---------------------------------------------------|---------------------------------------|-----------------------------|--------------------------------------------------------------------|-------------------------------------------------|
| Azure Web Application/App Service    | Settings -> Configuration -> General Settings     | FTP State                             | Disabled                    | Disables FTP and FTPS deployments                                  | https://go.microsoft.com/fwlink/?linkid=871316  |
| Azure Web Application/App Service    | Settings -> Configuration -> General Settings     | Remote Debugging                      | Disabled                    | Stops remote application access for debuggers                      |                                                 |
| Azure Web Application/App Service    | Settings -> Configuration -> Application Settings | Application Settings                  | Environment Variables       | Configure all secure attributes as                                 |                                                 |
| Azure Web Application/App Service    | Settings -> TLS/SSL Settings                      | HTTPS only                            | On                          | Requires HTTPS connections                                         |                                                 |
| Azure Web Application/App Service    | Settings -> TLS/SSL Settings                      | Minimum TLS Version                   | 1.2                         | Requires minimum TLS 1.2                                           |                                                 |

## Database {#database}

Microsoft Azure has a PaaS option for Postgres. This is a great option for Django applications, because:

* It comes with built-in backup functionality
* You don't need to worry about deploying a database server
* The security can be managed from the Azure Portal

To deploy using my ARM template, use this command in the demo repository:

```console
az deployment group create \
  --resource-group your_resource_group \
  --template-file .arm-templates/db/template.json \
  --parameters server_name='mydatabase' region_code='southeastasia'
```

Once this is setup, you will want to go through the security policies. The security policies for Postgres can't (or won't) be exported to ARM at the moment. I don't really understand why, so here are the things I would check before proceeding:

| Service                              | Configuration Area                                | Setting                               | Recommended Value           | Purpose                                                            | Link                                            |
|--------------------------------------|---------------------------------------------------|---------------------------------------|-----------------------------|--------------------------------------------------------------------|-------------------------------------------------|
| Azure Database for PostGreSQL Server | Settings -> Connection Security                   | Firewall Rule                         | …                           | Configure web service IP                                           |                                                 |
| Azure Database for PostGreSQL Server | Settings -> Connection Security                   | Allow Access to Azure Services        | No                          | Removes Azure IP acesss and requires private endpoint connections  |                                                 |
| Azure Database for PostGreSQL Server | Settings -> Connection Security                   | SSL Settings - Enforce SSL connection | Enabled                     | Blocks plain-text connection                                       |                                                 |
| Azure Database for PostGreSQL Server | Security -> Advanced Thread Protection            | Advanced Threat Protection            | On                          | Monitors the logs for unusual activity                             | https://go.microsoft.com/fwlink/?linkid=2082788 |

I'm recommending against **Allow Access to Azure Services** because it doesn't just apply to IPs in your tenant, it applies to IPs in **any** tenant.
Having this enabled (which is the default) means any server deployed on Azure, **no matter who it belongs to** can connect to your database if they know the password.

The downside of disabling this is that you need to use the Layer 7 firewall built into Postgres and specify the IP address of every client you want to allow connections from. This needs to include the Web Applications that you create.

### (Optional) Using Private VNETS

An alternative deployment model is to create a private VNET just for your database connections and add a private endpoint to the database server. At the time of writing, the Azure Web Applications for Linux support for Private Endpoint Connections is **experimental** and when trying to set it up, I hit a number of major issues.

If you want to have auto-scaling, then manually adding an Allow rule for each deployment isn't going to work, so this would be the preferred deployment model.

### Creating the database

Something really important to note that isn't specific to Azure is that Django will not create the database in Postgres automatically like it does with SQLite.

Before you can run your database migrations you will need to create a new database. Use `psql` or a Postgres client to create the application database.

If you followed my advice about using named Client IPs only to connect to Postgres, you will need to add a rule on the Postgres instance for your local IP address.

### Configuring Django

With the initial database deployed, you can now configure Django to use the Postgresql service. This requires an additional package in your virtual environment, `psycopg2`.

Install the `psycopg2-binary` package to add support.

For local development, you can choose to either use SQLite or use the Postgres server in Azure, or install one locally.

Something important to consider is the testing and CI/CD pipeline, and for that reason I recommend sticking with two environments, Postgres for Staging and Production, and SQLite for development and testing.

To accomplish this, we're going to use _environment variables_ to configure Django because you should **never put passwords in `settings.py`** files. This has another benefit that environment variables are really simple to setup in Azure Web Apps.

These are the environment variables our app will use for databases:

| Category | Variable                   | Purpose                  |
|:---------|:---------------------------|:-------------------------|
| Database | `DJANGO_DATABASE_PASSWORD` | Postgres login password  |
| Database | `DJANGO_DATABASE_NAME`     | Postgres database name   |
| Database | `DJANGO_DATABASE_USER`     | Postgres login username  |
| Database | `DJANGO_DATABASE_SERVER`   | Postgres server hostname |

Your `settings.py` file should now have two database options, one for Staging/Production, and another for CI/CD:

```python
import os

...

if 'DJANGO_DATABASE_PASSWORD' in os.environ.keys():
    # Staging or production database
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['DJANGO_DATABASE_NAME'],
            'USER': os.environ['DJANGO_DATABASE_USER'],
            'PASSWORD': os.environ['DJANGO_DATABASE_PASSWORD'],
            'HOST': os.environ['DJANGO_DATABASE_SERVER'],
            'PORT': '5432',
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    }
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'cache_table',
        }
    }
else:
    # development database
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
```

### Caching on Postgres

In the Staging/Production branch, I've enabled [database-caching for Django](https://docs.djangoproject.com/en/3.0/topics/cache/#database-caching). Postgres on Azure is fast, low-latency and well-indexed- its an ideal alternative to REDIS.
To enable caching, add `'django.middleware.cache.UpdateCacheMiddleware'`, and `'django.middleware.cache.FetchFromCacheMiddleware'` to your `MIDDLEWARE` list.

Then, similar to the database setup have a configuration branch for production and a configuration branch for development and test. The development branch will use `DummyCache`, which is what you want for local development:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    ...
]

...

if 'DJANGO_DATABASE_PASSWORD' in os.environ.keys():
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'cache_table',
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
```

After configuring caching, run `python manage.py createcachetable` to create the cache table, making sure you have the database environment variables set on your console (otherwise this does nothing).

## Static files and media files

The tutorials for

1. Install `django-storage[azure]` into your virtual environment and add it to your `requirements.txt` file
2. Add `'storages'` to the list of `INSTALLED_APPS`
3. Create a `backend` module inside your application and define two (or more) classes for static and media files

There are plenty of options for the `AzureStorage` class, check them out at the [plugin documentation](https://django-storages.readthedocs.io/en/latest/backends/azure.html#settings).

I recommend something simple to start with, a class for static files and a class for media files.

```python
from django.conf import settings
from storages.backends.azure_storage import AzureStorage


class AzureMediaStorage(AzureStorage):
    account_name = settings.AZURE_ACCOUNT_NAME
    account_key = settings.AZURE_STORAGE_KEY
    azure_container = settings.AZURE_MEDIA_CONTAINER
    expiration_secs = None
    overwrite_files = True


class AzureStaticStorage(AzureStorage):
    account_name = settings.AZURE_ACCOUNT_NAME
    account_key = settings.AZURE_STORAGE_KEY
    azure_container = settings.AZURE_STATIC_CONTAINER
    expiration_secs = None

```

Next, in `settings.py` configure the default media storage (`DEFAULT_FILE_STORAGE`) and static files storage to the Azure Storage containers.

Again, we're going to use environment variables, one for the storage key and another for the container names:

| Category             | Variable                                  | Purpose                                                       | Required (Dev) | Required (Production) | Default Value      |
|:---------------------|:------------------------------------------|:--------------------------------------------------------------|:---------------|:----------------------|:-------------------|
| Azure Storage        | `AZURE_STORAGE_KEY`                       | Azure Blob Storage API Key                                    | No             | Yes                   | False              |
| Azure Storage        | `AZURE_MEDIA_CONTAINER`                   | Azure Storage Container name for media files                  | No             | Yes                   | `media`            |
| Azure Storage        | `AZURE_STATIC_CONTAINER`                  | Azure Storage Container name for static files                 | No             | Yes                   | `static`           |

You need to get a storage access key from `Storage Account > (your account) > Settings > Access keys > key1 > key`.
Set the value of this key to the environment variable `'AZURE_STORAGE_NAME'`.

If you want to have separate media or static containers between production and development/test, you can use environment variables to accomplish this.

Next, update `settings.py` to reflect the new setup:

```python
DEFAULT_FILE_STORAGE = 'django_on_azure.backend.AzureMediaStorage'
STATICFILES_STORAGE  = 'django_on_azure.backend.AzureStaticStorage'

AZURE_STORAGE_KEY = os.environ.get('AZURE_STORAGE_KEY', False)
AZURE_ACCOUNT_NAME = "demo"  # your account name
AZURE_MEDIA_CONTAINER = os.environ.get('AZURE_MEDIA_CONTAINER', 'media')
AZURE_STATIC_CONTAINER = os.environ.get('AZURE_STATIC_CONTAINER', 'static')

# AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.azureedge.net'  # CDN URL
AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.blob.core.windows.net'  # Files URL

STATIC_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_STATIC_CONTAINER}/'
MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_MEDIA_CONTAINER}/'

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# any static paths you want to publish
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'demo', 'static')
]
```

There are two options for deployment, using the Azure Storage containers default HTTP/HTTPS endpoint, or using an Azure CDN Caching endpoint.
I strongly recommend setting up a CDN endpoint as it will dramatically improve performance for your users. To create an endpoint, `Storage Account > (your account) > Blob service > Azure CDN > New Endpoint`.

In `settings.py`, change the `AZURE_CUSTOM_DOMAIN` to the `.azureedge.net` URL (default), or if you configured a custom URL, put this URL in here:

```python
AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.azureedge.net'  # CDN URL
```

Now that you've configured everything, its time to test this out and run `collectstatic`.

## Testing

### Reproducable Environment Testing

In the test cycle, its going to be really important that the environments are as identical-as-possible. For example, if you develop locally on Python 3.8, and you test on Python 3.8 locally,
but your production environment is Pyth

```ini
[tox]
envlist = py37, lint

[testenv]
deps = -rrequirements-test.txt
commands = python -m pytest

[testenv:lint]
deps =
    -rrequirements-dev.txt

commands =
    flake8 demo
```

## Security

### Django Security

### Package Security

### Environment Security

## Performance

* Creating a load test
* Analysing response times

## Monitoring


