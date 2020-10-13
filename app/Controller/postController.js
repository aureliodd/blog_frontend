class PostController{
    
    constructor(){
        this.posts = [];
        this.orderedPosts = [];
        this.restController = new RestController();
        this.httpUrl = "http://localhost:3000/posts";
        this.modify = false;
        this.id_to_modify;
        this.id_to_delete;

        //UI
        this.postContainer;
        this.orderPriorityCheckbox;
        this.newPostButton;
        this.titlePost;
        this.bodyPost;
        this.userName;
        this.tags;
        this.modal;
        this.blankPost
    }

    init(){
        $(document).ready(function(){
            this.postContainer = $("#posts");
            this.orderPriorityCheckbox = $("#order-priority");
            this.newPostButton = $("#post");
            this.modal = $("#modal");
            this.blankPost = $("#blanktext")

            this.orderPriorityCheckbox.change(function() {
                this.orderPriorityCheckbox.prop("checked") ? this.displayPosts(1) : this.displayPosts(0);
            }.bind(this)); 
            
            this.newPostButton.click(function(){
                this.userName = $("#name");
                this.titlePost = $("#recipient-name");
                this.bodyPost = $("#message-text");
                this.privatePost = $("#private-post"); 
                this.importnt = $("#in-evidence");
                let user = this.userName.val(); 
                var title = this.titlePost.val();
                var content = this.bodyPost.val();
                let importnt = this.importnt.prop("checked"); //true se è importante
                let priv = this.privatePost.prop("checked"); //false se è pubblico
                this.CreateModifyPost(user, title, content, importnt, priv);
            }.bind(this));

            this.getPosts();

        }.bind(this));
    }

    addPostToArray(post){ this.posts.push(post); this.orderedPosts.push(post) }

    getPosts(){
        this.restController.get(this.httpUrl,function(data,status,xhr){
            for(var element in data)
                this.addPostToArray(new Post(data[element]._id,data[element].creator,data[element].title,data[element].content,data[element].priority,data[element].public,data[element].tags));
            this.displayPosts();
        }.bind(this));
    }

    displayPosts(prior = 0){
        this.postContainer.html("");
        let aux_post;

        if(prior == 0) aux_post = this.posts
        else aux_post = this.orderPosts();

        for(var post of aux_post){
            let newpost = this.addTextPost(post);
                        
            if(post.priority > 0) this.important(newpost);
            if(!post.public_post) this.privatePost(newpost);

            this.addPostToFeed(newpost);

            this.deleteBtn = $(".delete",newpost);
            this.modifyBtn = $(".modify",newpost);

            this.deleteBtn.click(function(event){
                let div_id_to_delete = event.target.closest("section");
                this.id_to_delete= $(div_id_to_delete).data("identifier");        

                this.restController.delete(this.httpUrl + "/" + id_to_delete, function(){
                    location.reload(); //success
                });
            }.bind(this));

            this.modifyBtn.click(function(event){
                this.modify = true;
                let div_id_to_modify = event.target.closest("section");
                this.id_to_modify  = $(div_id_to_modify).data("identifier");
                this.openModal();
            }.bind(this));
        }
    }

    CreateModifyPost(user, title, content, importnt, priv){
        var string_tags = $("#tags").val();
        var tags = string_tags.split(",");

        if(this.modify == false){
            let post_to_send = {creator: user, title: title, content: content, public: !priv, priority: Number(importnt), tags: tags };
           
            var data = { url: this.httpUrl, crossDomain: true, data: post_to_send, dataType: "json",
                success: function(data,textStatus,jqXHR){
                    let post = new Post(data._id, data.creator, data.title, data.content, data.priority, data.public, tags);
                    this.addPostToArray(post);
                    var newpost = this.addTextPost(post);
                
                    if(data.priority) this.important(newpost);
                    if(!data.public) this.privatePost(newpost);

                    $(".send-comment",newpost).click(function(event){
                        var commentSection = event.target.parentNode.parentNode;
                        this.comment(commentSection);
                    }.bind(this));

                    this.addPostToFeed(newpost);
            }.bind(this)};

            $.post(data);
        
        } else {
            var post_to_modify = { title: title, content: content, public: !priv, priority: Number(importnt), tags: tags };
        
            var data = {
                url: this.httpUrl+ "/" + this.id_to_modify,
                data: post_to_modify,
                dataType: "json",
                success: function(data,textStatus,jqXHR){console.log("data",data); }};
            
            this.restController.patch(data);
            this.modify = false;
        }
        this.hideModal();
        this.resetModal();
    }

    addTextPost(post){

        var newpost = this.blankPost.clone();
        newpost.removeAttr("id");

        $(newpost).data("identifier", post.id); //aggiungo identifier al dataset

        $(".creator",newpost).html(post.creator);
        $(".title",newpost).html(post.title);
        $(".content", newpost).html(post.content);

        //tags
        var tag_aux = "";
        if(post.tags != null){
            for(var tag of post.tags)
                tag_aux += " #"+ tag;

            $(".tags", newpost).html(tag_aux);
        }

        $(".send-comment",newpost).click(function(event){
            var commentSection = event.target.parentNode.parentNode;
            var name = $("#name").val() ? $("#name").val() : "Anonimo";
    
            var textarea = $(".write-comment", commentSection);
                if(textarea.val()!== ""){
                    var commentarea = $(".comment-area",commentSection.parentNode);
                    var newdiv = $('<div class="card py-1 px-2 my-2"><p> <span class="badge badge-primary">'+ name +'</span>  ' + textarea.val() + '</p></div>');
                    textarea.val("");

                    if(commentarea.html()== "Nessun commento"){ commentarea.html(""); newdiv.appendTo(commentarea);}
                    else newdiv.appendTo(commentarea);
                }
        });
        return newpost;
    }

    resetModal(){ $(this.titlePost).val(""); $(this.bodyPost).val(""); }

    openModal(){ $(this.modal).modal('show');}

    hideModal(){  $(this.modal).modal("hide"); }
    
    important(content){ content.addClass("border border-primary"); }

    privatePost(content){ content.addClass("private-post"); }
    
    addPostToFeed(newpost){
        this.show(newpost);
        this.postContainer.append(newpost);
    }
    
    show(content){ content.addClass("visible"); content.removeClass("hide"); }

    orderPosts(){ return this.orderedPosts.sort(function(a,b) {return b.priority - a.priority;}); } //descending order
}