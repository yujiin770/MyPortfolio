document.addEventListener('DOMContentLoaded', () => {

    // --- DARK MODE SYNC ---
    // This checks if the 'theme' is set to 'dark' in the browser's memory
    // from the main portfolio page and applies the dark-mode class if it is.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // --- ACCORDION FUNCTIONALITY ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            // Toggle the 'active' class on the item
            const isActive = item.classList.toggle('active');

            // Set the max-height for a smooth CSS transition
            if (isActive) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0px';
            }
        });
    });

});