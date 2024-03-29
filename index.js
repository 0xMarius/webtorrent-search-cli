const TorrentSearchApi = require('torrent-search-api');
const readline = require('readline');
const { exec } = require('child_process');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getUserInput(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function getUserInputs() {
    let query;
    while (!query) {
        query = await getUserInput('Enter query: ');
    }
    const category = (await getUserInput('Enter category (default is "All"): ')) || 'All';
    const limit = parseInt((await getUserInput('Enter limit (default is 10): ')) || '10');

    return { query, category, limit };
}

async function getUserSelection(torrents) {
    let selection;
    while(!selection) {
        selection = await getUserInput('Enter selection: ');
    }
    rl.close();
    return torrents.find(obj => obj.index === parseInt(selection));
}

function drawTorrents(torrents) {
    for (const torrent of torrents) {
        let title = torrent.title.length > 50 ? torrent.title.slice(0, 48) + '..' : torrent.title.padEnd(50);
        let line = `${String(torrent.index).padEnd(3)} | ${title} | ${String(torrent.seeds).padStart(3)} | ${torrent.provider.padStart(2)}`;
        console.log(line);
    }
}

async function getMagnet(arrayItem) {
    return await TorrentSearchApi.getMagnet(arrayItem);
}

function stream(magnet) {
    exec(`mpv ${magnet}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error}`);
        }
    });
}

async function main() {
    TorrentSearchApi.enablePublicProviders();

    const { query, category, limit } = await getUserInputs();
    const torrents = await TorrentSearchApi.search(query, category, limit);
    drawTorrents(torrents);

    const arrayItem = await getUserSelection(torrents);
    const magnet = await getMagnet(arrayItem);
    stream(magnet);
}

main();
