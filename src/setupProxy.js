const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    const port = process.env.PORT || 3001;
    app.use('/auth/**', 
        createProxyMiddleware({ 
            target:  'http://localhost:' + port
        })
    );
};
