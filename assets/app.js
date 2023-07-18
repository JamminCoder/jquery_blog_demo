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

async function savePost(author, title, body, id) {
    const post = {
        id: id,
        author: author,
        title: title,
        body: body,
    };

    const posts = await getPostData();
    posts.push(post);
    console.log(posts);
    localStorage.setItem('posts', JSON.stringify(posts));
}

async function handlePostSubmition() {
    const formData = new FormData($('#new-post').get(0));
    const posts = await getPostData();

    const postTitle = formData.get('title');
    const postBody = formData.get('body');
    const postId = posts[posts.length - 1].id;
    const post = makePost(postId, postTitle, postBody, "You");
    $(".panel__posts").prepend(post);

    await savePost("You", postTitle, postBody, postId);
}

function makePost(author, title, body, id) {
    return `
    <div class='post' id='post-${ id }'>
        <h3 class='post__author'>${ author }</h3>
        <h4 class='post__title'>${ title }</h4>
        <p class='post__body'>${ body }</p>
        <div class='post__actions'>
            <button class='post__delete' id='delete-post-${ id }'>Delete</button>
        </div>
    </div>
    `;
}

function clearPosts() {
    $('.post').each((i, el) => el.remove());
    localStorage.clear('posts');
    localStorage.clear('users');
}

function renderPost(author, title, body, id) {
    const postHtml = makePost(author, title, body, id);
    $('.panel__posts').prepend(postHtml);

    const deleteId = `delete-post-${ id }`;
    $(`#${ deleteId }`).on("click", async () => {
        $(`#post-${ id }`).remove();

        const posts = await getPostData();
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i]
            if (post.id == id) {
                posts.splice(i, 1);
            } 
        }

        localStorage.setItem('posts', JSON.stringify(posts));
    })
}

async function renderPostData(posts) {
    posts.map((post, i) => {
        if (post.author) {
            renderPost(post.author, post.title, post.body, post.id);
            return;
        }

        getUser(post.userId).then(user => renderPost(user.username, post.title, post.body, post.id));
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
    
    $("#new-post button").on("click", e => {
        e.preventDefault();
        handlePostSubmition();
    });

    const data = await getPostData();
    renderPostData(data);
}

$(main);