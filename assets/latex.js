(() => {
    const delimiters = [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$", right: "$", display: false },
    ];
    const hasMath = /\\\(|\\\[|\$\$|\$[^$\n]+\$/.test(
        document.body.textContent,
    );

    if (!hasMath) return;

    const version = "0.16.22";
    const cdn = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/`;

    const loadScript = (src) =>
        new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.append(script);
        });

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `${cdn}katex.min.css`;
    document.head.append(stylesheet);

    loadScript(`${cdn}katex.min.js`)
        .then(() => loadScript(`${cdn}contrib/auto-render.min.js`))
        .then(() => {
            renderMathInElement(document.body, {
                delimiters,
                ignoredClasses: ["no-latex"],
                ignoredTags: [
                    "code",
                    "option",
                    "pre",
                    "script",
                    "noscript",
                    "style",
                    "textarea",
                ],
                strict: "warn",
                throwOnError: false,
            });
        })
        .catch((error) => {
            console.warn("Could not load KaTeX", error);
        });
})();
