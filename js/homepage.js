(function() {
    function escapeHTML(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function(character) {
            return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character];
        });
    }

    function linkURL(value) {
        try {
            var url = new URL(value);
            return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    function renderTalks(talks) {
        return talks.filter(function(talk) {
            return linkURL(talk.video) || linkURL(talk.url);
        }).map(function(talk, index) {
            var video = linkURL(talk.video);
            var hiddenClass = index >= 6 ? ' hidden-talk' : '';
            return '<a href="' + escapeHTML(video || linkURL(talk.url)) + '" class="talk-item' + hiddenClass + '" target="_blank" rel="noopener">' +
                '<span><span class="talk-title">' + escapeHTML(talk.title) + '</span>' +
                '<span class="talk-meta">' + escapeHTML(talk.conference) + ' &middot; ' + escapeHTML(talk.date) + '</span></span>' +
                '<span class="talk-link">' + (video ? 'Watch recording' : 'Session details') + '</span></a>';
        });
    }

    function renderPodcasts(podcasts) {
        return podcasts.filter(function(podcast) {
            return linkURL(podcast.url);
        }).map(function(podcast, index) {
            var episodeText = podcast.episode ? ' #' + podcast.episode : '';
            var hiddenClass = index >= 10 ? ' hidden-podcast' : '';
            var format = podcast.format ? '<span class="appearance-format">' + escapeHTML(podcast.format) + '</span>' : '';
            return '<a href="' + escapeHTML(linkURL(podcast.url)) + '" class="podcast-item' + hiddenClass + '" target="_blank" rel="noopener">' +
                '<span class="podcast-show">' + escapeHTML(podcast.show + episodeText) + '</span>' +
                '<span class="podcast-title">' + escapeHTML(podcast.title) + format + '</span>' +
                '<span class="podcast-date">' + escapeHTML(podcast.date) + '</span></a>';
        });
    }

    function loadList(options, fetcher) {
        return (fetcher || fetch)(options.url)
            .then(function(response) {
                if (!response.ok) throw new Error('Could not load ' + options.url);
                return response.json();
            })
            .then(function(data) {
                var entries = options.selectData ? options.selectData(data) : data;
                if (!Array.isArray(entries)) throw new Error('Expected a list');
                var items = options.render(entries);
                options.container.innerHTML = items.join('');
                options.toggle.hidden = items.length <= options.limit;
                options.status.hidden = items.length > 0;
                options.status.textContent = items.length ? '' : 'No appearances listed yet.';
            })
            .catch(function() {
                options.toggle.hidden = true;
                options.status.hidden = false;
                options.status.textContent = 'Unable to load this list. Please try again later.';
            });
    }

    function refreshProjectStars(elements, fetcher) {
        return Promise.all(Array.from(elements).map(function(element) {
            var repository = element.dataset.repository;
            if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) return;
            return (fetcher || fetch)('https://api.github.com/repos/' + repository, {credentials: 'omit'})
                .then(function(response) {
                    if (!response.ok) throw new Error('GitHub stars unavailable');
                    return response.json();
                })
                .then(function(repositoryData) {
                    var count = repositoryData.stargazers_count;
                    if (!Number.isSafeInteger(count) || count < 0) return;
                    element.querySelector('.star-count').textContent = count.toLocaleString('en-US');
                    element.title = 'GitHub stars refreshed from GitHub';
                })
                .catch(function() {
                    // Keep the committed count when GitHub is unreachable or rate-limited.
                });
        }));
    }

    function setupList(name, render, limit, selectData, label) {
        var container = document.getElementById(name + '-list');
        var toggle = document.getElementById(name + '-view-all');
        var button = toggle.querySelector('button');
        button.addEventListener('click', function() {
            var expanded = container.classList.toggle('show-all');
            button.setAttribute('aria-expanded', String(expanded));
            button.innerHTML = (expanded ? 'Show fewer ' : 'View all ') + label +
                ' <i class="fa fa-arrow-' + (expanded ? 'up' : 'down') + '" aria-hidden="true"></i>';
        });
        loadList({
            url: '/pages/' + (name === 'talk' ? 'talks' : 'podcasts') + '.json',
            container: container,
            toggle: toggle,
            status: document.getElementById(name + '-status'),
            render: render,
            limit: limit,
            selectData: selectData
        });
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = {
            renderTalks: renderTalks,
            renderPodcasts: renderPodcasts,
            loadList: loadList,
            refreshProjectStars: refreshProjectStars
        };
    } else {
        setupList('talk', renderTalks, 6, function(data) { return data.talks; }, 'talks');
        setupList('podcast', renderPodcasts, 10, null, 'appearances');
        refreshProjectStars(document.querySelectorAll('.project-stars[data-repository]'));
    }
})();
