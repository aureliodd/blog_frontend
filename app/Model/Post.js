function Post(id,creator,title,content,priority,public_post,tags){
    this.id = id
    this.creator = creator;
    this.title = title;
    this.content = content;
    this.priority = priority; //priority = featured
    this.public_post = public_post;  
    this.tags = tags;
}