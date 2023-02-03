const fs = require('fs');
const path = require('path');

const loadMedia = (request, response, filePath, fileType) => {
  const file = path.resolve(__dirname, filePath);

  //Check if fs is able to load file, sends error if not
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    //Gets range header, checking for which file byte the browser wants
    let { range } = request.headers;

    //If no range is provided, set it to 'bytes=0-'
    if (!range) {
      range = 'bytes=0-';
    }

    //Takes range header & modifies it into an array with the start and end bytes
    //Ex. takes 'bytes=0-(endbyte)' and turns it into an array with values '0' and '(endbyte)'
    const positions = range.replace(/bytes=/, '').split('-');

    //Parses first value in new positions array into an int
    //Second value in parseInt tells which number base to use (10 is what humans usually use)
    let start = parseInt(positions[0], 10);

    //Stores what total byte size file is
    const total = stats.size;
    //Checks if we were given an end byte value in header from client
    //If we did, parses that end value into an int similar to start value
    //If not, sets end value to the end value of file
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    //If start value is greater than end value, resets start value
    if (start > end) {
      start = end - 1;
    }

    //Calculates total chunk size stream is sending to browser
    const chunksize = (end - start) + 1;

    //Gives response saying it can receive file, but has not gotten everything yet
    //Sends info about file for use
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': fileType,
    });

    //Creates stream object for sending rest of file
    const stream = fs.createReadStream(file, { start, end });

    //Continues stream if it is still open
    stream.on('open', () => {
      stream.pipe(response);
    });

    //Ends stream response if there is an error
    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  loadMedia(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadMedia(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadMedia(request, response, '../client/bird.mp4', 'vidoe/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
