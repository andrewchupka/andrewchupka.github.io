$('iframe').load(function() {
    this.style.height =
        this.contentWindow.document.body.offsetHeight + 'px';
});