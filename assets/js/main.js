function getSupportById(supports, supportId) {
    let result;

    Object.keys(supports).forEach(function (key) {
        if (supports[key]['id'] === parseInt(supportId)) {
            result = supports[key];
        }
    });

    return result;
}

Vue.component('add-post', {
    data() {
        return {
            newPost: {
                title: '',
                content: '',
                date: moment(),
                featured_media: 0,
                status: 'publish'
            }
        }
    },
    methods: {
        clearNewPost() {
            this.newPost = {
                title: '',
                content: '',
                featured_media: 0
            };
        },
        addImage() {

            // Instantiates the variable that holds the media library frame.
            var meta_image;

            // If the frame already exists, re-open it.
            if (meta_image) {
                meta_image.open();
                return;
            }

            // Sets up the media library frame
            meta_image = wp.media.frames.meta_image = wp.media({
                button: {
                    text: 'Select'
                },
                library: {
                    type: 'image'
                },
                multiple: false  // Set to true to allow multiple files to be selected
            });

            // Runs when an image is selected.
            meta_image.on('select', function () {

                // Grabs the attachment selection and creates a JSON representation of the model.
                var media_attachment = meta_image.state().get('selection').first().toJSON();

                // Sends the attachment URL to our custom image input field.
                jQuery('#addProductImageId').val(media_attachment.id);

            });

            // Opens the media library frame.
            meta_image.open();
        },
        saveNewPost() {
            this.newPost.featured_media = jQuery('#addProductImageId').val();
            axios.post('http://localhost/wp-json/wp/v2/posts', this.newPost, {
                headers: {'X-WP-Nonce': wpApiSettings.nonce}
            })
                .then((response) => {
                    this.$emit('save-post', response.data);
                    jQuery('#addProductModal').modal('hide');
                    this.clearNewPost();
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    },
    template:
            `
      <div>
      <div class="">
        <button class="btn btn-success" data-toggle="modal" data-target="#addProductModal">Add Post</button>
      </div>
      <div class="modal fade" ref="modal" id="addProductModal" tabindex="-1" role="dialog"
           aria-labelledby="exampleModalLabel"
           aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Add Post</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form>
                <div class="form-group">
                  <label for="recipient-name" class="col-form-label">Title:</label>
                  <input type="text" class="form-control" id="post_title" v-model="newPost.title">
                </div>
                <div class="form-group">
                  <label for="post-content" class="col-form-label">Post Content:</label>
                  <textarea class="form-control" id="post-content"
                            v-model="newPost.content"></textarea>
                </div>

                <div>
                  <button type="button" class="btn btn-primary" v-on:click="addImage">Add image</button>
                  <input type="hidden" id="addProductImageId">
                </div>

              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal" v-on:click="clearNewPost">
                Close
              </button>
              <button type="button" class="btn btn-primary" v-on:click="saveNewPost">Save</button>
            </div>
          </div>
        </div>
      </div>
      </div>`

});

Vue.component('posts-list', {

    data() {
        return {
            posts: []
        }
    },
    methods: {
        savePost(post) {
            this.posts.push(post);
        },
        deletePost(post) {
            const postIndex = this.posts.indexOf(post);
            this.posts.splice(postIndex, 1);
        },
        updatePost(post){
            let updatePost = getSupportById( this.posts, post.id);
            updatePost.title.rendered = post.title;
            updatePost.content.rendered = post.content;
            updatePost.featured_media = post.featured_media;
        }
    },
    created() {
        axios.get('http://localhost/wp-json/wp/v2/posts')
            .then((response) => {
                this.posts = Object.assign(response.data, {});
            });
    },
    template: '<div>' +
        '<div class="container">' +
        '<div class="row">' +
        '<add-post v-on:save-post="savePost"></add-post>' +
        '<div class="card-deck">' +
        '<posts-item ' +
        'v-on:delete-post="deletePost"' +
        ' v-on:update-post="updatePost"' +
        ' v-for="(post , index) in this.posts" :key="post.id" :post.sync="post"></posts-item>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
});

Vue.component('posts-item', {
    data() {
        return {
            image: '',
            isEditing: false,
            updatePostData: {
                id: this.post.id,
                title: this.post.title.rendered,
                content: this.post.content.rendered,
                modified: this.post.modified,
                featured_media: ''
            }
        }
    },
    props: ['post'],
    computed: {
        featureImage() {
            if (this.post.featured_media !== 0) {

                axios.get('http://localhost/wp-json/wp/v2/media/' + this.post.featured_media)
                    .then((response) => {
                        this.image = response.data.source_url;
                    });

                return this.image;

            } else {
                return 'https://1080motion.com/wp-content/uploads/2018/06/NoImageFound.jpg.png';
            }
        },
        cleanMessage() {
            return this.$sanitize(this.post);
        }
    },
    methods: {
        updatePostImage() {
            // Instantiates the variable that holds the media library frame.
            var meta_image;

            // If the frame already exists, re-open it.
            if (meta_image) {
                meta_image.open();
                return;
            }

            // Sets up the media library frame
            meta_image = wp.media.frames.meta_image = wp.media({
                button: {
                    text: 'Select'
                },
                library: {
                    type: 'image'
                },
                multiple: false  // Set to true to allow multiple files to be selected
            });

            // Runs when an image is selected.
            meta_image.on('select', function () {

                // Grabs the attachment selection and creates a JSON representation of the model.
                var media_attachment = meta_image.state().get('selection').first().toJSON();

                // Sends the attachment URL to our custom image input field.
                jQuery('#updateImagePost').attr('src', media_attachment.url);
                jQuery('#updateImagePostId').val(media_attachment.id);

            });

            // Opens the media library frame.
            meta_image.open();
        },
        showUpdateFormPost() {
            this.isEditing = true;
        },
        updatePost() {
            this.updatePostData.featured_media = jQuery('#updateImagePostId').val() ? jQuery('#updateImagePostId').val() : this.post.featured_media;
            this.updatePostData.modified = moment();

            this.$emit('update-post', this.updatePostData);

            axios.post('http://localhost/wp-json/wp/v2/posts/' + this.updatePostData.id, this.updatePostData, {
                headers: {'X-WP-Nonce': wpApiSettings.nonce}
            })
                .then((response) => {
                    // console.log(response.data);
                    this.cancelUpdatePost();
                })
                .catch(function (err) {
                    console.log(err);
                });

        },
        cancelUpdatePost() {
            this.isEditing = false;
        },
        deletePostFromItem(post) {
            this.$emit('delete-post', post);
            axios.delete('http://localhost/wp-json/wp/v2/posts/' + post.id, {
                headers: {'X-WP-Nonce': wpApiSettings.nonce}
            })
                .then(() => console.log('success remove'))
                .catch(function (err) {
                    console.log(err);
                });
        }
    },
    template:
            `
      <div>
      <div class="card" style="width: 18rem;">

        <div class="" v-show="!isEditing">
          <img class="card-img-top" :src="this.featureImage" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">{{ post.title.rendered }}</h5>
            <p class="card-text" v-html="post.content.rendered"></p>
            <a v-bind:href="post.link" class="btn btn-primary">Read</a>
            <a class="btn btn-warning" v-on:click="showUpdateFormPost">Update</a>
            <a class="btn btn-danger" v-on:click="deletePostFromItem(post)">Delete</a>
          </div>
        </div>

        <div class="" v-show="isEditing">
          <img :src="this.featureImage" id="updateImagePost" v-on:click="updatePostImage">
          <input type="hidden" id="updateImagePostId">
          <input class="" v-model="updatePostData.title">
          <textarea class="" v-model="updatePostData.content"></textarea>
          <a class="btn btn-success" v-on:click="updatePost">Save</a>
          <a class="btn btn-danger" v-on:click="cancelUpdatePost">Cancel</a>


        </div>

      </div>

      </div>`
});

new Vue({
    el: document.getElementById('site-wrapper')
})