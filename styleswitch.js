var all_elements = document.querySelectorAll("*")

document.getElementById('graphic-switch').addEventListener('click', function() {
    for (var i=0; i<all_elements.length;i++){
        all_elements[i].classList.toggle('graphic-design');
    }
});
