const postsUrl = 'https://jsonplaceholder.typicode.com/posts';
const usersUrl = 'https://jsonplaceholder.typicode.com/users'

function getJson(url) {
    return new Promise((resolve, reject) => {
        $.get({
            url: url,
            success: resolve,
            error: reject
        });
    })
}

async function loadUsers() {
    let usersJson = await getJson(`${ usersUrl }`);
    localStorage.setItem('users', JSON.stringify(usersJson));
}

async function loadPosts() {
    const posts = await getJson(postsUrl);
    localStorage.setItem('posts', JSON.stringify(posts));
}

async function getPostData() {
    if (!localStorage.getItem('posts')) 
        await loadPosts();

    return JSON.parse(localStorage.getItem('posts'));
}

async function getUser(id) {
    if (!localStorage.getItem('users'))
        await loadUsers();

    const users = JSON.parse(localStorage.getItem('users'));
    
    for (let user of users) {
        if (user.id == id) return user;
    }

    return null;
}

function makePost(postId, body, author) {
    return `
    <div class='post' id='post-${ postId }'>
        <h3 class='post__author'>${ author }</h3>
        <p class='post__body'>${ body }</p>
        <div class='post__actions'>
            <button class='post__delete' id='delete-post-${ postId }'>Delete</button>
        </div>
    </div>
    `;
}

function clearPosts() {
    $('.post').each((i, el) => el.remove());
    localStorage.clear('posts');
    localStorage.clear('users');
}

async function renderPostData(posts) {
    posts.map((post, i) => {
        const deleteId = `delete-post-${ post.id }`;
        getUser(post.userId).then(user => {
            const postHtml = makePost(post.id, post.body, user.username);
            $('.panel__posts').append(postHtml);

            $(`#${ deleteId }`).on("click", () => {
                $(`#post-${post.id}`).remove();
            })
        });
    })
}

async function main() {
    console.log("JQuery ready.");
    $('#refresh').on("click", async () => {
        clearPosts();
        await loadPosts();
        await loadUsers();
        const data = await getPostData();
        renderPostData(data);
    })
    
    const data = await getPostData();
    renderPostData(data);
}

$(main);