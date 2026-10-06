/**
 * Gán data-theme trước lần paint đầu tiên để không bị nháy sáng/tối.
 * Mặc định là giao diện sáng; chỉ dùng giao diện tối khi người dùng đã tự chọn trước đó.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;
