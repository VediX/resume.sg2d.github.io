fetch("/README.md").then(async function(response) {
	var converter = new showdown.Converter({ simplifiedAutoLink: true, ghCompatibleHeaderId: true});
	var text = await response.text();
	var html = converter.makeHtml(text);
	document.querySelector("#markdown_content").innerHTML = html;
	
	if (location.hash.replace(/^#/, "")) {
		location.href = location.href;
	}
});

window.es6_supported = true;