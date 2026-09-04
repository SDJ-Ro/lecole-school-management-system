// The sign-in pages still work without this file
{
    const photos = document.querySelectorAll('[data-role-image]');

    const showPhoto = (role) =>
    {
        photos.forEach((photo) => photo.classList.toggle('is-active', photo.dataset.roleImage === role));
    };

    document.querySelectorAll('.auth-role').forEach((link) =>
    {
        link.addEventListener('mouseenter', () => showPhoto(link.dataset.role));
        link.addEventListener('mouseleave', () => showPhoto(''));   // An empty photo shows the collage again
    });

    // The demo button fills the form with a test account
    document.querySelectorAll('.auth-demo').forEach((button) =>
    {
        button.addEventListener('click', () =>
        {
            const form = document.querySelector('.auth-form');
            form.identifier.value = button.dataset.identifier;
            form.password.value = button.dataset.password;
        });
    });
}

