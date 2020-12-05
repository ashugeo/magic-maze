function Member(id,
                name,
                isSpectator = undefined,
                isBot = false) {
    this.id = id;
    this.name = name;
    this.isSpectator = isSpectator;
    this.isBot = isBot;
    this.roles = [];
    this.isConnected = true;
}

module.exports = Member;
