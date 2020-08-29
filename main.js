var eventBus = new Vue();

Vue.component('product', {

    props:{
        premium:{
            type: Boolean,
            required: true
        }
    },
    template: `<div class="product">
        
    <div class="product-image">
      <img :src="image" />
    </div>

    <div class="product-info">
        <h1>{{ product }}</h1>
        <p v-if="inStock">In Stock</p>
        <p v-else>Out of Stock</p>
        <p>User is premium: {{premium}}
        <p>Shipping: {{ shipping }}</p>

        <product-details :details="details"></product-details>

        <div class="color-box"
             v-for="(variant, index) in variants" 
             :key="variant.variantId"
             :style="{ backgroundColor: variant.variantColor }"
             @mouseover="updateProduct(index)"
             >
        </div> 

        <button v-on:click="addToCart" 
          :disabled="!inStock"
          :class="{ disabledButton: !inStock }"
          >
        Add to cart
        </button>

        <button v-on:click="removeFromCart" 
          :disabled="!inStock"
          :class="{ disabledButton: !inStock }"
          >
        Remove from cart
        </button>

        <product-tabs :reviews="reviews"></product-tabs>

     </div>

  </div>`,
data() {
    return {
        brand: 'Guineys',
        product: 'Socks',
        link: 'www.calvincooke.me',
        //image: './assets/socks-green.jpg',
        //selectedVariant is 0 to use as index to select from array
        selectedVariant: 0,
        //inStock: false,
        inventory: 0,
        onSale: false,
        details: ["80% cotton", "20% polyester", "Really cool"],
        sizes: ["s", "m", "l"],
        variants: [
            {
                variantId: 2234,
                variantColor: "green",
                variantImage: './assets/socks-green.jpg',
                variantQuantity: 10
            },
            {
                variantId: 2235,
                variantColor: "blue",
                variantImage: './assets/socks-blue.jpg',
                variantQuantity: 0
            }
        ],
        reviews: []
    }
},
methods: {

    addToCart(){

        //Emitting an even with selected variants id as a property
        this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
     
    },
    removeFromCart(){

        this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)

    },
    updateProduct(index){

        //Index is passed in depending on which coloured div you hoer over
        this.selectedVariant = index    
        console.log(index);

    }

},
computed: {

    title(){
        return this.brand + ' ' + this.product
    },
    image() {
        return this.variants[this.selectedVariant].variantImage
    },
    inStock(){
        return this.variants[this.selectedVariant].variantQuantity
    },
    sale(){

        if(this.onSale){
            return this.brand + " " + this.product + "are on sale"
        }

    },
    shipping(){
        
        //computing properties based on props being input
        if(this.premium){
            return "Free"
        }
        return 2.99
    }

},
//Lifecyclehook - code that you want to run as soon as the component is "mounted" to the DOM
mounted(){

    eventBus.$on('review-submitted', productReview => {

        //review-submitted event is sent from product-review component through eventBus
        this.reviews.push(productReview);

    })

}

})

Vue.component('product-tabs', {
    
    //This component takes in a property of 'reviews', which is passed in from the parent component through binding
    props:{
        reviews: {
            type: Array,
            required: true
        }
    },
   template: `
   <div>

        <span class="tab"
        :class="{activeTab: selectedTab == tab}"   
        v-for="(tab, index) in tabs" :key="index"
        @click="selectedTab=tab">
        {{tab}}</span>

        <div v-show="selectedTab === 'Reviews' ">
        <h2>Reviews</h2>
        <p v-if="!reviews.length">There are no reviews yet..</p>

        <ul>
            <li v-for="review in reviews">
            
                <p>{{review.name}}</p>
                <p>Rating: {{review.rating}}</p>
                <p>{{review.review}}</p>
                <p>Reccommend to a friend? {{review.reccommend}}</p>

            </li>
        </ul>

        </div>

        <product-review v-show="selectedTab === 'Make a review' "></product-review>

   </div>  
    `,
   data(){

    return{
        tabs: ['Reviews', 'Make a review'],
        selectedTab: 'Reviews'
    }

   }
    
})


Vue.component('product-details',{
    props:{
        details :{
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>`
})

Vue.component('product-review',{
    template: `

        <form class="review-form" @submit.prevent="onSubmit">

            <p v-if="errors.length">

                <b>Please corect the following error(s):</b>

                <ul>
                    <li v-for="error in errors">{{error}}</li>
                </ul>

            </p>

            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name">
            </p>

            <p>
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>

            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>

            <p>
                <label> Recommend to a friend? </label>
                <br>
                <label for="one">Yes</label>
                <input type="radio" id="one" value="Yes" v-model="reccommend">                
                <br>
                <label for="two">No</label>
                <input type="radio" id="two" value="No" v-model="reccommend">
                <br>
            </p>

            <p>
                <input type="submit" value="submit">
            </p>

        </form>
    `,
    data(){
        return {
            name: null,
            review: null,
            rating: null,
            reccommend: null,
            errors: []

        }
    },
    methods: {

        onSubmit(){

            //Ensure values are filled in
            if(this.name && this.review && this.rating && this.reccommend){

                //Create a variable containing an object which we'll create using our data
                let productReview = {

                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    reccommend: this.reccommend

                }

                //Send review object up to parent
                eventBus.$emit('review-submitted', productReview)

                //reset form values to null after submitting
                this.name = null
                this.review = null
                this.rating = null
                this.reccommend = null
            }
            //Collect the approriate erros and push them into the error array if values aren't filled out
            else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.reccommend) this.errors.push("Reccommendation required.")
            }
        }
    }
})

//Create a new vue instance
var app = new Vue({

    //Create a new element property, which connects to the dvi with the i.d of "app"
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods:{

        updateCart(id){

            this.cart.push(id)

        },
        removeFromCart(id){

            for(var i = this.cart.length - 1; i >= 0; i--) {
                if (this.cart[i] === id) {
                   this.cart.splice(i, 1);
                }
            }

        }

    }    

})