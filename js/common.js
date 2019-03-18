const validarToken = async (token) => {
    token = token || getCookie('jwt') || new URL(location.href).searchParams.get('redirectTo') || '';
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
                emptyCookies();
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
        emptyCookies();
        location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
    };
}
validarToken();
const emptyCookies = () => {
    setCookie({
        name: 'jwt',
        value: '',
        day: 0,
        force: true
      });
      setCookie({
        name: 'username',
        value: '',
        day: 0,
        force: true
      });
      setCookie({
        name: 'email',
        value: '',
        day: 0,
        force: true
      });
};