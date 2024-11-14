
const periodicRefreshPeriod = 100000;
let categories = [];
let selectedCategory = "";
let search = "";
let currentETag = "";
let hold_Periodic_Refresh = false;
let pageManager;
let itemLayout;

let waiting = null;
let waitingGifTrigger = 2000;

function addWaitingGif() {
    clearTimeout(waiting);
    waiting = setTimeout(() => {
        $("#itemsPanel").append($("<div id='waitingGif' class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
    }, waitingGifTrigger)
}
function removeWaitingGif() {
    clearTimeout(waiting);
    $("#waitingGif").remove();
}

Init_UI();

async function Init_UI() {
    itemLayout = {
        width: $("#sample").outerWidth(),
        height: $("#sample").outerHeight()
    };
    pageManager = new PageManager('scrollPanel', 'itemsPanel', itemLayout, renderPosts);
    compileCategories();
    $('#createPost').on("click", async function () {
        renderCreatePostForm();
    });
    $('#abort').on("click", async function () {
        showPosts()
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $("#searchKey").on("input", () => {
        doSearch();
    })
   /* $('#doSearch').on('click', () => {
        doSearch();
    })*/
    $('#doSearch').on('click', () => {
        var searchInput = document.getElementById("search");
        if (searchInput.style.display === "none" || searchInput.style.display === "") {
            searchInput.style.display = "block"; 
        } else {
            searchInput.style.display = "none"; 
        }
    })
  /*  document.getElementById("search").addEventListener("click", function() {
        var searchInput = document.getElementById("searchInput");
        if (searchInput.style.display === "none" || searchInput.style.display === "") {
            searchInput.style.display = "block"; 
        } else {
            searchInput.style.display = "none"; 
        }
    });

    document.getElementById("searchInput").addEventListener("input", function() {
        searchInput = this.value;
        pageManager.reset();
    });*/
    showPosts();
    start_Periodic_Refresh();
}

function doSearch() {
    search = $("#searchKey").val().replace(' ', ',');
    pageManager.reset();
}

function showPosts() {
    $("#actionTitle").text("Chouettes Nouvelles");
    $("#scrollPanel").show();
    $('#abort').hide();
    $('#PostForm').hide();
    $("#search").show();
    $('#aboutContainer').hide();
    $("#createPost").show();
    hold_Periodic_Refresh = false;
}
function hidePosts() {
    $("#scrollPanel").hide();
    $("#createPost").hide();
    $("#abort").show();
    hold_Periodic_Refresh = true;
}
function start_Periodic_Refresh() {
    setInterval(async () => {
        if (!hold_Periodic_Refresh) {
            let etag = await API_Posts.HEAD();
            if (currentETag != etag) {
                currentETag = etag;
                await pageManager.update(false);
                compileCategories();
            }
        }
    },
        periodicRefreshPeriod * 1000);
}
function renderAbout() {
    hidePosts();
    $("#actionTitle").text("À propos...");
    $("#aboutContainer").show();
}
function updateDropDownMenu() {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="allCatCmd">
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
        </div>
        `));
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append($(`
            <div class="dropdown-item menuItemLayout category" id="allCatCmd">
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
            </div>
        `));
    })
    DDMenu.append($(`<div class="dropdown-divider"></div> `));
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="aboutCmd">
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
        </div>
        `));
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#allCatCmd').on("click", function () {
        showPosts();
        selectedCategory = "";
        updateDropDownMenu();
        pageManager.reset();
    });
    $('.category').on("click", function () {
        showPosts();
        selectedCategory = $(this).text().trim();
        updateDropDownMenu();
        pageManager.reset();
    });
}
async function compileCategories() {
    categories = [];
    let response = await API_Posts.GetQuery("?fields=category&sort=category");
    if (!API_Posts.error) {
        let items = response.data;
        if (items != null) {
            items.forEach(item => {
                if (!categories.includes(item.Category))
                    categories.push(item.Category);
            })
            updateDropDownMenu(categories);
        }
    }
}
async function renderPosts(queryString) {
    if (selectedCategory != "") queryString += "&category=" + selectedCategory;
    if (search != "") queryString += "&keywords="+search;
    addWaitingGif();
    let endOfData = true;
    let response = await API_Posts.Get(queryString);
    if (!API_Posts.error) {
        currentETag = response.ETag;
        let Posts = response.data;
        if (Posts.length > 0) {
            Posts.forEach(Post => {
                $("#itemsPanel").append(renderPost(Post));
            });
            $(".editCmd").off();
            $(".editCmd").on("click", function () {
                renderEditPostForm($(this).attr("editPostId"));
            });
            $(".deleteCmd").off();
            $(".deleteCmd").on("click", function () {
                renderDeletePostForm($(this).attr("deletePostId"));
            });
        } else
           $("#itemsPanel").html('<div class="noPostsMessage">Aucun post disponible</div>');
            endOfData = true;
    } else {
        renderError(API_Posts.currentHttpError);
    }
    removeWaitingGif();
    return endOfData;
}

function renderError(message) {
    hidePosts();
    $("#actionTitle").text("Erreur du serveur...");
    $("#errorContainer").show();
    $("#errorContainer").append($(`<div>${message}</div>`));
}
function renderCreatePostForm() {
    renderPostForm();
}
async function renderEditPostForm(id) {
    addWaitingGif();
    let response = await API_Posts.Get_edit(id)
    if (!API_Posts.error) {
        let Post = response.data;
        if (Post !== null)
            renderPostForm(Post);
        else
            renderError("Post introuvable!");
    } else {
        renderError(API_Posts.currentHttpError);
    }
    removeWaitingGif();
}
async function renderDeletePostForm(id) {
    hidePosts();
    $("#actionTitle").text("Retrait");
    $('#PostForm').show();
    $('#PostForm').empty();
    let response = await API_Posts.Get(id)
    if (!API_Posts.error) {
        let Post = response.data;
        if (Post !== null) {
            $("#PostForm").append(`
        <div class="PostdeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="PostRow" id=${Post.Id}">
                <div class="PostContainer noselect">
                    <div class="PostLayout">
                        <div class="Post">
                            <span class="PostTitle">${Post.Title}</span>
                        </div>
                        <span class="PostCategory">${Post.Category}</span>
                    </div>
                    <div class="PostCommandPanel">
                        <span class="editCmd cmdIcon fa fa-pencil" editPostId="${Post.Id}" title="Modifier ${Post.Title}"></span>
                        <span class="deleteCmd cmdIcon fa fa-trash" deletePostId="${Post.Id}" title="Effacer ${Post.Title}"></span>
                    </div>
                </div>
            </div>   
            <br>
            <input type="button" value="Effacer" id="deletePost" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
            $('#deletePost').on("click", async function () {
                await API_Posts.Delete(Post.Id);
                if (!API_Posts.error) {
                    showPosts();
                    await pageManager.update(false);
                    compileCategories();
                }
                else {
                    console.log(API_Posts.currentHttpError)
                    renderError("Une erreur est survenue!");
                }
            });
            $('#cancel').on("click", function () {
                showPosts();
            });

        } else {
            renderError("Post introuvable!");
        }
    } else
        renderError(API_Posts.currentHttpError);
}

function newPost() {
    Post = {};
    Post.Id = 0;
    Post.Title = "";
    Post.Text = "";
    Post.Category = "";
    Post.Image= "";
    Post.Creation = new Date().getTime();
    return Post;
}
function renderPostForm(Post = null) {
    hidePosts();
    let create = Post == null;
    if (create){
     Post = newPost();
     Post.Image = "images/no-avatar.png";
    }
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#PostForm").show();
    $("#search").hide();
    $("#PostForm").empty();
    $("#PostForm").append(`
        <form class="form" id="PostForm">
            <br>
            <input type="hidden" name="Id" value="${Post.Id}"/>
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal"
                value="${Post.Title}"
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                value="${Post.Category}"
            />
            <label for="Text" class="form-label">Text</label>
            <textarea
                class="form-control text"
                name="Text"
                id="Text"
                placeholder="Entrez votre texte"
                required
                value=${Post.Text}/>
                ${Post.Text}
            </textarea>
            <label class="form-label">Image </label>
            <div   class='imageUploader' 
                   newImage='${create}' 
                   controlId='Image' 
                   imageSrc='${Post.Image}' 
                   waitingImage="Loading_icon.gif">
            </div>
            <input type="hidden" name="Creation" value="${Post.Creation}" />
            <br>
            <input type="submit" value="Enregistrer" id="savePost" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initImageUploaders();
    initFormValidation();
    $('#PostForm').on("submit", async function (event) {
        event.preventDefault();
       let Post= getFormData($("#PostForm"));
        Post = await Bookmarks_API.Save(Post, create);
        /*let formData = new FormData(event.target);  
            let postData = {};
        formData.forEach((value, key) => {
            postData[key] = value;
        });
        Post = await API_Posts.Save(postData, create);*/
        if (!API_Posts.error) {
            showPosts();
            await pageManager.update(false);
            compileCategories();
            pageManager.scrollToElem(Post.Id);
        }
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        showPosts();
    });
}
function formatDate(creationTimestamp) {
    const creationDate = new Date(creationTimestamp);
    return creationDate.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
    }) + ', ' + creationDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit', 
        minute: '2-digit'
    });
}

function renderPost(Post) {
    const formattedDate = formatDate(Post.Creation);
    return $(`
     <div class="post-row" id='${Post.Id}'>
        <div class="post-container noselect">
            <div class="PostLayout">
                <div class="post-cover" style="background-image:url('${Post.Image}')"></div>
                <div ="post-body">
                   <div class="post-title">
                      <span class="PostTitle">${Post.Title}</span>
                   </div>
                   <span class="PostCategory">${Post.Category}</span>
                   <div class="post-summary">
                     <p>${Post.Text}</span>
                    </div>
                <hr>
                <span> Publié: ${formattedDate}</span>  
            </div>
            <div class="PostCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editPostId="${Post.Id}" title="Modifier ${Post.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deletePostId="${Post.Id}" title="Effacer ${Post.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}
