Vue.component('posts-list', {

    data() {
        return {
            posts: []
        }
    },
    methods: {
        deletePost(post){
            const postIndex = this.posts.indexOf(post);
            this.posts.splice(postIndex , 1);
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
        '<div class="card-deck">' +
        '<posts-item ' +
        'v-on:delete-post="deletePost"' +
        'v-for="(post , index) in this.posts" :key="post.id" :post.sync="post"></posts-item>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
});

Vue.component('posts-item', {
    data() {
        return {
            image: ''
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
        deletePostFromItem(post){
            this.$emit('delete-post' , post);
            axios.delete('http://localhost/wp-json/wp/v2/posts/' + post.id ,{
                headers: {'X-WP-Nonce':wpApiSettings.nonce}
            })
                .then(() => console.log('success remove'))
                .catch(function (err) {
                    console.log(err);
                });
        }
    },
    template: '<div>' +
        '<div class="card" style="width: 18rem;">\n' +
        '  <img class="card-img-top" :src="this.featureImage" alt="Card image cap">\n' +
        '  <div class="card-body">\n' +
        '    <h5 class="card-title">{{post.title.rendered}}</h5>\n' +
        '    <p class="card-text" v-html="post.content.rendered"></p>\n' +
        '<a v-bind:href="` ${post.link} `" class="btn btn-primary">Read</a>' +
        '<a class="btn btn-danger" v-on:click="deletePostFromItem(post)">Delete</a>' +
        '  </div>\n' +
        '</div>' +

        '</div>'
});

new Vue({
    el: document.getElementById('site-wrapper')
})