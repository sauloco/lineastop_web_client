//tslint

$(document).ready(() => {
    validarToken();
})


const validarToken = async (token) => {
    token = token || getCookie('jwt') || '';
    if (!token) {
        if (location.href.indexOf('login') < 0) {
            location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
        }
    };
    const data = await fetchData({
        endpoint: api.users.me,
        token
    });
    try {
        if (location.href.indexOf('login') < 0) {
            if (data.error) {
                location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
            }
        } else {
            if (!data.error) {
                const url = new URL(location.href);
                const redirectTo = url.searchParams.get('redirectTo');
                location.href = redirectTo ? decodeURIComponent(redirectTo) : '/';
            }
        }
    } catch (error) {
        location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
    };
}