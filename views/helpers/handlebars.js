function hbsHelpers() {
    return {
        helpers: {
            translate: function(value) {
                switch (value) {
                case "senior-rep":
                    return "Senior Representative";
                case "junior-rep":
                    return "Junior Representative";
                case "president":
                    return "President";
                case "vp-internal":
                    return "VP Internal";
                case "vp-external":
                    return "VP External";
                case "admin":
                    return "System Admin";
                case "secretary":
                    return "Secretary";
                case "community":
                    return "Community Liason";
                case "treasurer":
                    return "Treasurer";
                default:
                    return value;
                }
            },
        },
    };
}

module.exports = hbsHelpers;