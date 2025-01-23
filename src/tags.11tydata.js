module.exports = {
    eleventyComputed: {
        permalink: data => `/tags/${data.tag}/index.html`,
        title: data => `Posts tagged "${data.tag}"`,
        layout: "base"
    }
}; 