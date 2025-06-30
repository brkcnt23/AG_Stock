const socket = io();

        socket.on('connect', () => {
            console.log('Socket bağlı!');
        });

        socket.on('log', (data) => {
            console.log('Yeni işlem:', data);
            const div = document.createElement('div');
            div.textContent = `${new Date().toLocaleString()} - ${data.bolum} ${data.islem}`;
            document.getElementById('logPanel').prepend(div);
        });

