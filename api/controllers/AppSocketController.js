module.exports = {
    async join(req, res) {
        /**
         * If the request is not from socket , refuse it
         */
        if (!req.isSocket) {
            return res.badRequest();
        }

        /**
         * We use karriz app id as room name
         */
        const karrizID = req.param('app');
        if (!karrizID) {
            return res.badRequest();
        }

        /**
         * Create room
         * @type {string}
         */
        const roomName = `karriz_${karrizID}`;
        if (typeof sails.rooms === 'undefined') {
            sails.rooms = {};
        }
        if (!sails.rooms[roomName]) {
            sails.rooms[roomName] = {};
        }

        // Join the room
        await sails.sockets.join(req, roomName, err => {
            if (err) {
                return res.send(ErrorHandler(2003));
            }
            return res.json({
                status: true,
                data  : {
                    socketId: req.socket.id,
                    roomName
                },
                message: `The user joined the room ${roomName} successfully. `
            });
        });
    },

    /**
     * Sense the typing
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async appChanged(req, res) {
        /**
         * If the request is not from socket , refuse it
         */
        if (!req.isSocket) {
            return res.badRequest();
        }

        /**
         * We use karriz app id as room name
         */
        const karrizID = req.param('app');
        if (!karrizID) {
            return res.badRequest();
        }

        /**
         * Create room
         * @type {string}
         */
        const roomName = `karriz_${karrizID}`;

        console.log(`------We got change :${roomName}`);

        const appInfo = await App
            .findOne({
                id: req.param('app')
            })
            .catch(err => res.json(
                ErrorHandler(0, err.message)
            ));


        // send the typing action to room
        sails.sockets.broadcast(roomName, 'karriz_board_changed', {
            json: appInfo.json
        });

        return res.ok();
    }
};