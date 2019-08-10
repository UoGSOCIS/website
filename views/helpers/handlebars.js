function hbsHelpers() {
    return {
        helpers: {
            translate: function(value) {
                switch (value) {
                case "senior-rep":
                    return "Senior Representative";
                case "junior-rep":
                    return "Junior Representative";
                default:
                    return value;
                }
            },
        },
    };
}

module.exports = hbsHelpers;