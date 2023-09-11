const env = require('dotenv')
const express = require('express');
const sp = require('@supabase/supabase-js')
const {OpenAI} = require('openai')
const fs = require("fs")

env.config();
const app = express();
const port = 3000;

const supabase = sp.createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: {
        persistSession: false
    }
});

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY // This is also the default, can be omitted
  });

//embed the given chunked text using openai embedding api to get vector
function embedText(inputText) {
    try {
        var result = "";
        return new Promise((resolve) => {
            openai.embeddings.create({
                    model: "text-embedding-ada-002",
                    input: inputText,
                })
                .then((res) => {
                    console. log(res)
                    result = res.data[0]["embedding"];
                });
            setTimeout(() => {
                resolve(result);
            }, 2000);
        })
    } catch (error) {
        console.error(err);
    }
}

async function searchVectorInSupabase(embedding) {
    try {
        const { data: documents } = await supabase.rpc('search_vector', {
            query_embedding: embedding,
            match_threshold: 0.78,
            match_count: 5,
        })
        console.log(documents);
    } catch (error) {
        console.error("Error executing search query:", error);
    }
}

function GetInputQueryAndSearchVectorDB() {
    try {
        var query = "what is stocks";
        //Step 1: Embed the user
        embedText(query).then((embedding) => {
            // Step 2: Search vector DB
            searchVectorInSupabase(embedding);
        });
    } catch (error) {
        console.error(error);
    }
}

async function ReadDocumentContentToSupbaseDBTable() {
    try {
        fs.readFile("documents/dd.pdf", "utf8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            // Concatenate lines into a single paragraph
            const lines = data.split("\n");
            const concatenatedFileText = lines.join("™ ").trim().replace(/\s+/g, " ");
            // Create chunks of data
            const chunkSize = 500; // Adjust the chunk size as per your requirements
            const chunks = createChunks(concatenatedFileText, chunkSize);
            // Perform embedding on each chunk
            for (const chunk of chunks) {
                embedText(chunk).then(async (result) => {
                    //save to supbase postgres database
                    const { data, error } = await supabase
                        .from("semantic_vector_search")
                        .insert({
                            content: chunk,
                            embedding: result,
                        });
                    setTimeout(() => { }, 500);
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
}

//split the given text to chunks
function createChunks(inputText, chunksize) {
    const chunks = [];
    let i = 0;
    while (i < inputText.length) {
     chunks.push(inputText.slice(i, i + chunksize));
     i += chunksize;
    }
    return chunks;
  }


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    ReadDocumentContentToSupbaseDBTable();
    GetInputQueryAndSearchVectorDB();
});