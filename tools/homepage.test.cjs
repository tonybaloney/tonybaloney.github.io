const assert = require('node:assert/strict');
const test = require('node:test');
const {renderTalks, renderPodcasts, loadList, refreshProjectStars} = require('../js/homepage.js');

test('talks link to recordings or session pages, escape content, and skip unsafe links', () => {
    const items = renderTalks([
        {title: '<Python & Friends>', conference: 'PyCon', date: '2025', video: 'https://example.com/video', url: 'https://example.com/session'},
        {title: 'Workshop', conference: 'PyCon', date: '2025', url: 'https://example.com/workshop'},
        {title: 'Unsafe', video: 'javascript:alert(1)'},
    ]);
    assert.equal(items.length, 2);
    assert.match(items[0], /href="https:\/\/example.com\/video"/);
    assert.match(items[0], /&lt;Python &amp; Friends&gt;/);
    assert.match(items[0], /Watch recording/);
    assert.match(items[1], /href="https:\/\/example.com\/workshop"/);
    assert.match(items[1], /Session details/);
});

test('talks initially show six items and appearances show ten with video labels', () => {
    const talk = {title: 'Talk', url: 'https://example.com/talk'};
    const talks = renderTalks(Array(7).fill(talk));
    assert.doesNotMatch(talks[5], /hidden-talk/);
    assert.match(talks[6], /hidden-talk/);

    const podcast = {show: 'On .NET', title: 'CSnakes', date: '2025', format: 'Video interview', url: 'https://example.com/interview'};
    const podcasts = renderPodcasts(Array(11).fill(podcast));
    assert.match(podcasts[0], /Video interview/);
    assert.doesNotMatch(podcasts[0], /#null|#undefined/);
    assert.doesNotMatch(podcasts[9], /hidden-podcast/);
    assert.match(podcasts[10], /hidden-podcast/);
});

test('list loading handles wrapped talk data, short lists, and empty lists', async () => {
    const options = {
        url: '/pages/talks.json',
        container: {innerHTML: ''},
        toggle: {hidden: false},
        status: {hidden: false, textContent: 'Loading'},
        render: renderTalks,
        selectData: data => data.talks,
        limit: 6,
    };
    await loadList(options, async () => ({
        ok: true,
        json: async () => ({talks: [{title: 'Workshop', url: 'https://example.com/workshop'}]}),
    }));
    assert.match(options.container.innerHTML, /Workshop/);
    assert.equal(options.toggle.hidden, true);
    assert.equal(options.status.hidden, true);

    await loadList(options, async () => ({ok: true, json: async () => ({talks: []})}));
    assert.equal(options.container.innerHTML, '');
    assert.equal(options.status.hidden, false);
    assert.match(options.status.textContent, /No appearances/);
});

test('failed or malformed list responses display an error instead of an empty section', async () => {
    for (const fetcher of [
        async () => ({ok: false}),
        async () => ({ok: true, json: async () => ({talks: null})}),
        async () => { throw new Error('Offline'); },
    ]) {
        const options = {
            url: '/pages/talks.json',
            container: {innerHTML: ''},
            toggle: {hidden: false},
            status: {hidden: true},
            render: renderTalks,
            selectData: data => data.talks,
            limit: 6,
        };
        await loadList(options, fetcher);
        assert.equal(options.toggle.hidden, true);
        assert.equal(options.status.hidden, false);
        assert.match(options.status.textContent, /Unable to load/);
    }
});

test('live star counts include zero and leave fallback counts intact on API failures', async () => {
    const counts = [0, 4205, 'invalid', -1, null];
    const elements = counts.map((count, index) => {
        const value = {textContent: '95'};
        return {
            dataset: {repository: 'tonybaloney/project-' + index},
            title: 'Snapshot',
            querySelector: () => value,
        };
    });
    await refreshProjectStars(elements, async url => {
        const index = Number(url.at(-1));
        return {ok: true, json: async () => ({stargazers_count: counts[index]})};
    });
    assert.equal(elements[0].querySelector().textContent, '0');
    assert.equal(elements[1].querySelector().textContent, '4,205');
    for (const element of elements.slice(2)) {
        assert.equal(element.querySelector().textContent, '95');
        assert.equal(element.title, 'Snapshot');
    }
    for (const fetcher of [
        async () => ({ok: false, status: 403}),
        async () => { throw new Error('Offline'); },
    ]) {
        await refreshProjectStars([elements[2]], fetcher);
        assert.equal(elements[2].querySelector().textContent, '95');
    }
});
