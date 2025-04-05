const helpers = {
    navLink: function(url, options) {
        return '<li' + 
            ((url == options.data.root.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
        if (lvalue != rvalue) return options.inverse(this);
        return options.fn(this);
    }
};

module.exports = helpers;
