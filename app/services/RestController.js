class RestController{

    constructor(){ }

    get(url,onSuccess,onError){
        $.get({
            url: url,
            success: onSuccess
          });
    }

    post(url,data,onSuccess,onError){
        $.post({
            url: url,
            data:JSON.stringify(data),
            success: onSuccess
          });
    }

    patch(url,patch ,onSuccess,onError){
        $.ajax({
            type: 'PATCH',
            url: url,
            data: JSON.stringify(patch),
            //processData: false,
            //contentType: 'application/merge-patch+json',
            crossDomain: true,
            success: onSuccess,
         });
    }

    delete(url,onSuccess,onError){
        $.ajax({
            type: 'DELETE',
            url: url,
            crossDomain: true,
            success: onSuccess,
            });
    }

}