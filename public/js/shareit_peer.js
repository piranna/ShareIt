var downfiles = {};

socket.on('files.list', function(data)
{
	ui_updatefiles_peer(JSON.parse(data))

	info('files.list: '+Object.keys(JSON.parse(data)));
});

socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	var file = downfiles[filename];
	file.data += data;

	if(file.chunks == chunk)
		ui_filedownloaded(filename, file.data);
	else
	{
		ui_filedownloading(filename, Math.floor(chunk/file.chunks * 100));

		// Demand more data
		socket.emit('transfer.query_chunk', filename, parseInt(chunk)+1);
	}
});

function transfer_begin(file)
{
	ui_filedownloading(file.name, 0)

	var chunks = file.size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	downfiles[file.name] = {data:'', chunk:0, chunks:chunks};

	// Demand data from the begining of the file
	socket.emit('transfer.query_chunk', file.name, 0);
}