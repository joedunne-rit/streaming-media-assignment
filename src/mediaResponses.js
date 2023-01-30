const fs = require('fs');
const path = require('path');

const getParty = (request, response) => {
    const file = path.resolve(__dirname, '../client/party.mp4');

    fs.stat(file, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                response.writeHead(404);
            }
            return response.end(err);
        }

        let { range } = request.headers;

        if (!range) {
            range = 'bytes=0-';
        }
    });
};

module.exports.getParty = getParty;