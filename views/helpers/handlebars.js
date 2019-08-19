function hbsHelpers() {
    return {
        helpers: {
            translate: function(value) {
                switch (value) {
                case "senior-rep":
                    return "Senior Representative";
                case "junior-rep":
                    return "Junior Representative";
                case "student-rep":
                    return "Student Representative";
                case "first-year-rep":
                    return "First Year Representative";
                case "president":
                    return "President";
                case "vp-internal":
                    return "VP Internal";
                case "vp-external":
                    return "VP External";
                case "vp-communications":
                    return "VP Communications";
                case "vp-finance":
                    return "VP Finance";
                case "admin":
                    return "System Admin";
                case "secretary":
                    return "Secretary";
                case "community":
                    return "Community Liaison";
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