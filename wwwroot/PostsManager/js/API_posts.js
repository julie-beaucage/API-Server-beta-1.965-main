
//"https://well-ubiquitous-session.glitch.me/api/posts"
//"http://localhost:5000/api/posts"
class API_Posts {
    static API_URL() { return "http://localhost:5000/api/posts" };
    static initHttpState() {
        this.currentHttpError = "";
        this.currentStatus = 0;
        this.error = false;
    }
    static setHttpErrorState(xhr) {
        if (xhr.responseJSON)
            this.currentHttpError = xhr.responseJSON.error_description;
        else
            this.currentHttpError = xhr.statusText == 'error' ? "Service introuvable" : xhr.statusText;
        this.currentStatus = xhr.status;
        this.error = true;
    }
   static async HEAD() {
        API_Posts.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL(),
                type: 'HEAD',
                contentType: 'text/plain',
                complete: data => { resolve(data.getResponseHeader('ETag')); },
                error: (xhr) => { API_Posts.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    /*static async Get(id = null, queryString = "") {
        API_Posts.initHttpState();
            let url = this.API_URL();
        if (id != null) {
            url += "/" + id;  
        }
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
        return new Promise(resolve => {
            $.ajax({
                url: url,
                complete: data => {
                    resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON });
                },
                error: (xhr) => {
                    API_Posts.setHttpErrorState(xhr);
                    resolve(null);
                }
            });
        });
    }
    */
    static async Get(id = null) {
        API_Posts.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + (id != null ? "/" + id : ""),
                complete: data => { resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON }); },
                error: (xhr) => { API_Posts.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
   /* static async Get(queryString = "") {
        API_Posts.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + queryString,
                complete: data => { resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON }); },
                error: (xhr) => { API_Posts.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }*/
    

   /* static async Get(id = null, query = "") {
        console.log(query);
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + (id != null ? "/" + id : query),
                complete: data => {  resolve({ETag:data.getResponseHeader('ETag'), data:data.responseJSON }); },
                error: (xhr) => { API_Posts.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }*/
        /*static async Get_edit(id = null) {
            try {
                console.log("Appel à Get() avec id : ", id);
                API_Posts.initHttpState();
                const url = this.API_URL() + (id != null ? "/" + id : "");
                console.log("URL générée : ", url); 
                                return new Promise(resolve => {
                    $.ajax({
                        url: url, 
                        type: 'GET',
                        complete: data => {
                            console.log("Réponse reçue : ", data); // Afficher la réponse pour débogage
                            resolve({ 
                                ETag: data.getResponseHeader('ETag'), 
                                data: data.responseJSON 
                            });
                        },
                        error: (xhr) => {
                            console.error("Erreur AJAX : ", xhr); // Afficher l'erreur complète
                            API_Posts.setHttpErrorState(xhr); 
                            resolve(null);
                        }
                    });
                });
            } catch (error) {
                console.error("Erreur dans Get() : ", error);
                return null;
            }
        }*/
        

/*static async Get(queryString = "") {
    API_Posts.initHttpState();
    const url = this.API_URL() + (id != null ? `/${id}` : queryString);
    return new Promise(resolve => {
        $.ajax({
            url: url,
            type: 'GET',
            complete: data => { 
                resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON }); 
            },
            error: (xhr) => { 
                API_Posts.setHttpErrorState(xhr); 
                resolve(null); 
            }
        });
    });
}*/
/*static getWords(query = "") {
    API_Posts.initHttpState();
    return new Promise(resolve => {
        $.ajax({
            url: this.API_URL() + query,
            success: words => { resolve(words); },
            error: (xhr) => { API_Posts.setHttpErrorState(xhr); resolve(null); }
        });
    });
}*/
    static async GetQuery(queryString = "") {
        API_Posts.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + queryString,
                complete: data => {
                    resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON });
                },
                error: (xhr) => {
                    API_Posts.setHttpErrorState(xhr); resolve(null);
                }
            });
        });
    }
    static async Save(data, create = true) {
        API_Posts.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: create ? this.API_URL() : this.API_URL() + "/" + data.Id,
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: (data) => { resolve(data); },
                error: (xhr) => { API_Posts.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    static async Delete(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + "/" + id,
                type: "DELETE",
                complete: () => {
                    API_Posts.initHttpState();
                    resolve(true);
                },
                error: (xhr) => {
                    API_Posts.setHttpErrorState(xhr); resolve(null);
                }
            });
        });
    }
}