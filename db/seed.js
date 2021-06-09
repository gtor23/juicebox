const {client, getAllUsers, createUser, updateUser,
    createPost, updatePost, getAllPosts, getPostsByUser,getUserById, 
    createTags, addTagsToPost, getPostById, getPostsByTagName
  } = require('./index')
// const chalk = require {chalk}



async function dropTables(){

  try{

    console.log("Starting to drop tables...");

    await client.query(`DROP TABLE IF EXISTS post_tags;`);
    await client.query(`DROP TABLE IF EXISTS tags;`);
    await client.query(`DROP TABLE IF EXISTS posts;`);
    await client.query(`DROP TABLE IF EXISTS users;`);
    
    console.log("Finished dropping tables!");

  }catch (error){
    console.log("Error dropping tables!");
    throw error;
  }
}

async function createTables(){


    await client.query(`
            CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name varchar(225) NOT NULL,
            location varchar(225) NOT NUll,
            active BOOLEAN DEFAULT true
            );
        `)

  await client.query(`

            CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
            );
        `)

  await client.query(`
      CREATE TABLE tags(
        id SERIAL PRIMARY KEY,
        name VARCHAR(225) UNIQUE NOT NULL
      );
  `)

  await client.query(`
      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")
      );
  `)

}



async function populateDB(){
    // await client.query(`
    
    // INSERT INTO users (username, password)
    // VALUES

    // ('albert', 'bertie99'),
    // ('sandra', '2sandy4me'),
    // ('glamgal', 'soglam');

    // `)

    let users = [
        {username: 'albert', password: 'bertie99', name:'Al Bert', location: 'Chicago, IL'},
        {username: 'sandra', password: '2sandy4me', name: 'sandy', location: 'Los Angeles, CA'},
        {username: 'glamgal', password: 'soglam', name:'glammy', location: 'Pheonix, AZ'},
    ]

    await Promise.all(users.map((user) => {
         return createUser(user)
    })
    )
}

async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();

      console.log("Starting to create posts...");
  
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
      });
  
      await createPost({
        authorId: sandra.id,
        title: "How does this work?",
        content: "Seriously, does this even do anything?",
        tags: ["#happy", "#worst-day-ever"]
      });

      await createPost({
        authorId: glamgal.id,
        title: "Living the Glam Life",
        content: "Do you even? I swear that half of you are posing.",
        tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
      });

      console.log("Finished creating posts!");
      // a couple more
    } catch (error) {
      console.log("Error creating posts!");
      throw error;
    }
  }


// async function createInitialTags() {
//     try {
//       console.log("Starting to create tags...");
  
//       const [happy, sad, inspo, catman] = await createTags([
//         '#happy', 
//         '#worst-day-ever', 
//         '#youcandoanything',
//         '#catmandoeverything'
//       ]);
  
//       const [postOne, postTwo, postThree] = await getAllPosts();
  
//       await addTagsToPost(postOne.id, [happy, inspo]);
//       await addTagsToPost(postTwo.id, [sad, inspo]);
//       await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
//       console.log("Finished creating tags!");
//     } catch (error) {
//       console.log("Error creating tags!");
//       throw error;
//     }
//   }


async function rebuildDB(){
    try {
        client.connect();
    
        await dropTables();
        await createTables();
        await populateDB();
        await createInitialPosts()
        
        // await createInitialTags()

        // await updateUser();

    //     await updateUser(3, {
    //     name: 'travis', 
    //     location:'Tucson, AZ', 
    //     active: false
    // });

        // await testDB();

      } catch (error) {
        // console.error(error);
        console.log('Error during rebuildDB')
        throw error;

      } 
    //   finally {
    //     client.end();
    //   }
}

async function testDB(){
  try{



      // client.connect()

      // const result = await client.query(`SELECT * FROM users;`)

      // let rows = await getAllUsers()
      // console.log(rows)

      console.log("Starting to test database...");

      console.log("Calling getAllUsers");
      const users = await getAllUsers();
      console.log("Result:", users);
  
      console.log("Calling updateUser on users[0]");
      const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);
  
      console.log("Calling getAllPosts");
      const posts = await getAllPosts();
      console.log("Result:", posts);
  
      console.log("Calling updatePost on posts[0]");
      const updatePostResult = await updatePost(posts[0].id, {
        title: "New Title",
        content: "Updated Content"
      });
      console.log("Result:", updatePostResult);
  
      console.log("Calling getUserById with 1");
      const albert = await getUserById(1);
      console.log("Result:", albert);
  
      console.log("Finished database tests!");



      console.log("Calling updatePost on posts[1], only updating tags");
      const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"]
      });
      console.log("Result:", updatePostTagsResult);


      console.log("Calling getPostsByTagName with #happy");
      const postsWithHappy = await getPostsByTagName("#happy");
      console.log("Result:", postsWithHappy);
      console.log('Results--:', postsWithHappy[0].tags)
      console.log('Results--1:', postsWithHappy[1].tags)

  }catch (error){
      // console.error(error) // console log errors
      console.log('Error during testDB');
      throw error;
  }
  // finally{
  //     client.end() //close our connection to the db
  // }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());

// testDB()