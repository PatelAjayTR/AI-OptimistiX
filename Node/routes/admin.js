const express = require('express');
const { OpenAI } = require('openai');
const sp = require('@supabase/supabase-js');


const router = express.Router()

//Post Method
router.post('/', async (req, res) => {
    const body = req.body;
    const response = await GetInputQueryAndSearchVectorDB(body.message);
    var content = "";
    response.forEach(element => {
        content += element.content + " ";
    });
    const data = await getCompletionData(content);
    res.setHeader('content-type', 'text/html');
    res.send(data);
})

const openai = new OpenAI({
    apiKey: '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' // This is also the default, can be omitted
});

const supabase = sp.createClient('https://hzimkjxtouwyfslgkoml.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aW1ranh0b3V3eWZzbGdrb21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ0MzU5MzQsImV4cCI6MjAxMDAxMTkzNH0.fhOSQjUtbLMS9c3IfMa76squR5QLukf2PcPIQL_saS4', {
    auth: {
        persistSession: false
    }
});

//embed the given chunked text using openai embedding api to get vector
async function embedText(chunk, link) {
    try {
        const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

        const text = 'This is a large text and I am generating embeddings for numerical reference as system doesnt understand string';

        const client = new OpenAIClient("https://eastus-highq-lab-openai.openai.azure.com", new AzureKeyCredential("83cc6862e1c9464dbec0c9a814593780"));
        return await client.getEmbeddings('text-embedding-ada-002', chunk).then(async (res) => {
            // console.log(res.data[0].embedding);
            var embeddedData = res.data[0].embedding;

            if (!link) {
                const data = await searchVectorInSupabase(embeddedData);
                return data;
            }

            await supabase
                .from("embedding_content")
                .insert({
                    content: link,
                    embedding: res.data[0].embedding,
                }).then((res) => {
                    console.log(res);
                });
        });


    } catch (error) {
        console.error(error);
    }
}

async function searchVectorInSupabase(embedding) {
    try {
        const {data, error} = await supabase.rpc('search_data', {
            query_embedding: embedding,
            match_threshold: 0.8,
            match_count: 3,
        })
        return data;
    } catch (error) {
        console.error("Error executing search query:", error);
    }
}

async function GetInputQueryAndSearchVectorDB(query) {
    try {
        // var query = "How to add isheet item?"; //"can be configured to require approval before content is uploaded or updated by any user";
        //Step 1: Embed the user input
        const embedding = await embedText(query);
        // const a = await searchVectorInSupabase(embedding);
        console.log({embedding})
        return embedding;
    } catch (error) {
        console.error(error);
    }
}

async function ReadDocumentContentToSupbaseDBTable() {

    embeddAndSave("documents/t1.text", "https://knowledge.highq.com/help/getting-started/activate-a-collaborate-account-and-log-in");
    embeddAndSave("documents/t2.text", "https://knowledge.highq.com/help/working-with-content/isheets-item-drafts");
    embeddAndSave("documents/t3.text", "https://knowledge.highq.com/help/working-with-content/isheets-add-items");
    embeddAndSave("documents/t4.text", "https://knowledge.highq.com/help/getting-started/workflow-approval");
    embeddAndSave("documents/t5.text", "https://knowledge.highq.com/help/working-with-content/import-isheet-data");
}

async function embeddAndSave(fileName, link) {
    try {
        fs.readFile(fileName, "utf8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            // Concatenate lines into a single paragraph
            const lines = data.split("\n");
            const concatenatedFileText = lines.join("™ ").trim().replace(/\s+/g, " ");
            // Create chunks of data
            const chunkSize = 50; // Adjust the chunk size as per your requirements
            const chunks = createChunks(concatenatedFileText, chunkSize);
            // Perform embedding on each chunk
            for (const chunk of chunks) {
                embedText(chunk, link).then(async (result) => {

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

async function embedTextEmbedding(searchText) {
    try {
        var searchText1 = '\\nWorkflow and process automation empowers firms to automate legal processes. Whether itâ€™s legal project management, due diligence reporting, AI-powered contract review or transaction and litigation management, workflow brings people, content, and process together.\\n\\nWorkflow is a premium feature of the HighQ platform - if you do not have it enabled and want to evaluate it please speak to your account manager.\\n\\nWatch our introduction video on workflows:\\n\\xa0\\n\\n\\n\\n\\n\\n\\xa0\\n\\nA site administrator can build a workflow; however any site user can trigger rules, be assigned a task and receive custom emails, as part of the workflow process.\\n\\n\\nTo make the best use of workflow you should ensure that the Files, iSheets, Tasks and Events modules are all enabled.\\n\\n\\xa0\\nBuilding workflows and rules overview\\nAdd a workflow\\xa0in Admin >\\xa0Workflow management, then build rules that trigger actions\\xa0in your workflow process.\\nA single workflow can contain multiple\\xa0rules; then\\xa0each rule\\xa0defines the\\xa0triggers that,\\xa0if\\xa0conditions are met,\\xa0start\\xa0one or more actions.\\n\\n\\nSee\\xa0Manage workflows to automate tasks for best practices when adding workflows.\\n\\nBuilding rules in Workflow\\nA workflow is defined in a step-by-step process:\\n\\n\\nAdd a workflow\\xa0as a container that will hold\\xa0a set of related rules.\\n\\n\\nStart to build your rule -\\xa0add\\xa0a rule description to your workflow.\\n\\n\\nAdd triggers with conditions to the rule, based on:\\n\\niSheet records\\nFiles\\nTasks\\nDates\\n\\nSchedule\\n\\n\\n\\n\\nAdd actions to the rule (each article below describes\\xa0a single type of action):\\n\\nAdd a folder and sub-folders\\nMove / copy / delete a file\\nAutomatically send emails\\nAdd tasks and sub-tasks\\nChange a task assignee\\nAdd events\\nUpdate iSheet columns\\xa0(choice, date, user lookup, single-line text and multi-line text)\\nAdd\\xa0iSheet record\\nUpdate file metadata\\nGenerate document\\n\\nSend for approval (send a file)\\n\\n\\n\\n\\nActivate both\\xa0the workflow and your rules:\\n\\nOpen the Rule builder\\xa0screen and click More actions\\xa0for your\\xa0workflow description, select\\xa0Activate\\xa0to change the status of a\\xa0Draft\\xa0workflow to\\xa0Active.\\nEach rule must also be activated -\\xa0open the rule\\xa0then click\\xa0More actions\\xa0for each\\xa0rule that is needed\\xa0and select\\xa0Activate.\\n\\n\\n\\n\\xa0\\nWorkflow audit history\\nThe Workflow history audit\\xa0allows you to search through historical workflow activity and also test workflow rules without searching for the automated outputs.\\n';
        var searchText2 = '\\nWorkflow and process automation empowers firms to automate legal processes. Whether itâ€™s legal project management, due diligence reporting, AI-powered contract review or transaction and litigation management, workflow brings people, content, and process together.\\n\\nWorkflow is a premium feature of the HighQ platform - if you do not have it enabled and want to evaluate it please speak to your account manager.\\n\\nWatch our introduction video on workflows:\\n\\xa0\\n\\n\\n\\n\\n\\n\\xa0\\n\\nA site administrator can build a workflow; however any site user can trigger rules, be assigned a task and receive custom emails, as part of the workflow process.\\n\\n\\nTo make the best use of workflow you should ensure that the Files, iSheets, Tasks and Events modules are all enabled.\\n\\n\\xa0\\nBuilding workflows and rules overview\\nAdd a workflow\\xa0in Admin >\\xa0Workflow management, then build rules that trigger actions\\xa0in your workflow process.\\nA single workflow can contain multiple\\xa0rules; then\\xa0each rule\\xa0defines the\\xa0triggers that,\\xa0if\\xa0conditions are met,\\xa0start\\xa0one or more actions.\\n\\n\\nSee\\xa0Manage workflows to automate tasks for best practices when adding workflows.\\n\\nBuilding rules in Workflow\\nA workflow is defined in a step-by-step process:\\n\\n\\nAdd a workflow\\xa0as a container that will hold\\xa0a set of related rules.\\n\\n\\nStart to build your rule -\\xa0add\\xa0a rule description to your workflow.\\n\\n\\nAdd triggers with conditions to the rule, based on:\\n\\niSheet records\\nFiles\\nTasks\\nDates\\n\\nSchedule\\n\\n\\n\\n\\nAdd actions to the rule (each article below describes\\xa0a single type of action):\\n\\nAdd a folder and sub-folders\\nMove / copy / delete a file\\nAutomatically send emails\\nAdd tasks and sub-tasks\\nChange a task assignee\\nAdd events\\nUpdate iSheet columns\\xa0(choice, date, user lookup, single-line text and multi-line text)\\nAdd\\xa0iSheet record\\nUpdate file metadata\\nGenerate document\\n\\nSend for approval (send a file)\\n\\n\\n\\n\\nActivate both\\xa0the workflow and your rules:\\n\\nOpen the Rule builder\\xa0screen and click More actions\\xa0for your\\xa0workflow description, select\\xa0Activate\\xa0to change the status of a\\xa0Draft\\xa0workflow to\\xa0Active.\\nEach rule must also be activated -\\xa0open the rule\\xa0then click\\xa0More actions\\xa0for each\\xa0rule that is needed\\xa0and select\\xa0Activate.\\n\\n\\n\\n\\xa0\\nWorkflow audit history\\nThe Workflow history audit\\xa0allows you to search through historical workflow activity and also test workflow rules without searching for the automated outputs.\\n';
        var searchText3 = '\\nWorkflow and process automation empowers firms to automate legal processes. Whether itâ€™s legal project management, due diligence reporting, AI-powered contract review or transaction and litigation management, workflow brings people, content, and process together.\\n\\nWorkflow is a premium feature of the HighQ platform - if you do not have it enabled and want to evaluate it please speak to your account manager.\\n\\nWatch our introduction video on workflows:\\n\\xa0\\n\\n\\n\\n\\n\\n\\xa0\\n\\nA site administrator can build a workflow; however any site user can trigger rules, be assigned a task and receive custom emails, as part of the workflow process.\\n\\n\\nTo make the best use of workflow you should ensure that the Files, iSheets, Tasks and Events modules are all enabled.\\n\\n\\xa0\\nBuilding workflows and rules overview\\nAdd a workflow\\xa0in Admin >\\xa0Workflow management, then build rules that trigger actions\\xa0in your workflow process.\\nA single workflow can contain multiple\\xa0rules; then\\xa0each rule\\xa0defines the\\xa0triggers that,\\xa0if\\xa0conditions are met,\\xa0start\\xa0one or more actions.\\n\\n\\nSee\\xa0Manage workflows to automate tasks for best practices when adding workflows.\\n\\nBuilding rules in Workflow\\nA workflow is defined in a step-by-step process:\\n\\n\\nAdd a workflow\\xa0as a container that will hold\\xa0a set of related rules.\\n\\n\\nStart to build your rule -\\xa0add\\xa0a rule description to your workflow.\\n\\n\\nAdd triggers with conditions to the rule, based on:\\n\\niSheet records\\nFiles\\nTasks\\nDates\\n\\nSchedule\\n\\n\\n\\n\\nAdd actions to the rule (each article below describes\\xa0a single type of action):\\n\\nAdd a folder and sub-folders\\nMove / copy / delete a file\\nAutomatically send emails\\nAdd tasks and sub-tasks\\nChange a task assignee\\nAdd events\\nUpdate iSheet columns\\xa0(choice, date, user lookup, single-line text and multi-line text)\\nAdd\\xa0iSheet record\\nUpdate file metadata\\nGenerate document\\n\\nSend for approval (send a file)\\n\\n\\n\\n\\nActivate both\\xa0the workflow and your rules:\\n\\nOpen the Rule builder\\xa0screen and click More actions\\xa0for your\\xa0workflow description, select\\xa0Activate\\xa0to change the status of a\\xa0Draft\\xa0workflow to\\xa0Active.\\nEach rule must also be activated -\\xa0open the rule\\xa0then click\\xa0More actions\\xa0for each\\xa0rule that is needed\\xa0and select\\xa0Activate.\\n\\n\\n\\n\\xa0\\nWorkflow audit history\\nThe Workflow history audit\\xa0allows you to search through historical workflow activity and also test workflow rules without searching for the automated outputs.\\n';
        var searchText4 = '\\nWorkflow and process automation empowers firms to automate legal processes. Whether itâ€™s legal project management, due diligence reporting, AI-powered contract review or transaction and litigation management, workflow brings people, content, and process together.\\n\\nWorkflow is a premium feature of the HighQ platform - if you do not have it enabled and want to evaluate it please speak to your account manager.\\n\\nWatch our introduction video on workflows:\\n\\xa0\\n\\n\\n\\n\\n\\n\\xa0\\n\\nA site administrator can build a workflow; however any site user can trigger rules, be assigned a task and receive custom emails, as part of the workflow process.\\n\\n\\nTo make the best use of workflow you should ensure that the Files, iSheets, Tasks and Events modules are all enabled.\\n\\n\\xa0\\nBuilding workflows and rules overview\\nAdd a workflow\\xa0in Admin >\\xa0Workflow management, then build rules that trigger actions\\xa0in your workflow process.\\nA single workflow can contain multiple\\xa0rules; then\\xa0each rule\\xa0defines the\\xa0triggers that,\\xa0if\\xa0conditions are met,\\xa0start\\xa0one or more actions.\\n\\n\\nSee\\xa0Manage workflows to automate tasks for best practices when adding workflows.\\n\\nBuilding rules in Workflow\\nA workflow is defined in a step-by-step process:\\n\\n\\nAdd a workflow\\xa0as a container that will hold\\xa0a set of related rules.\\n\\n\\nStart to build your rule -\\xa0add\\xa0a rule description to your workflow.\\n\\n\\nAdd triggers with conditions to the rule, based on:\\n\\niSheet records\\nFiles\\nTasks\\nDates\\n\\nSchedule\\n\\n\\n\\n\\nAdd actions to the rule (each article below describes\\xa0a single type of action):\\n\\nAdd a folder and sub-folders\\nMove / copy / delete a file\\nAutomatically send emails\\nAdd tasks and sub-tasks\\nChange a task assignee\\nAdd events\\nUpdate iSheet columns\\xa0(choice, date, user lookup, single-line text and multi-line text)\\nAdd\\xa0iSheet record\\nUpdate file metadata\\nGenerate document\\n\\nSend for approval (send a file)\\n\\n\\n\\n\\nActivate both\\xa0the workflow and your rules:\\n\\nOpen the Rule builder\\xa0screen and click More actions\\xa0for your\\xa0workflow description, select\\xa0Activate\\xa0to change the status of a\\xa0Draft\\xa0workflow to\\xa0Active.\\nEach rule must also be activated -\\xa0open the rule\\xa0then click\\xa0More actions\\xa0for each\\xa0rule that is needed\\xa0and select\\xa0Activate.\\n\\n\\n\\n\\xa0\\nWorkflow audit history\\nThe Workflow history audit\\xa0allows you to search through historical workflow activity and also test workflow rules without searching for the automated outputs.\\n';
        var searchText5 = '\\nWorkflow and process automation empowers firms to automate legal processes. Whether itâ€™s legal project management, due diligence reporting, AI-powered contract review or transaction and litigation management, workflow brings people, content, and process together.\\n\\nWorkflow is a premium feature of the HighQ platform - if you do not have it enabled and want to evaluate it please speak to your account manager.\\n\\nWatch our introduction video on workflows:\\n\\xa0\\n\\n\\n\\n\\n\\n\\xa0\\n\\nA site administrator can build a workflow; however any site user can trigger rules, be assigned a task and receive custom emails, as part of the workflow process.\\n\\n\\nTo make the best use of workflow you should ensure that the Files, iSheets, Tasks and Events modules are all enabled.\\n\\n\\xa0\\nBuilding workflows and rules overview\\nAdd a workflow\\xa0in Admin >\\xa0Workflow management, then build rules that trigger actions\\xa0in your workflow process.\\nA single workflow can contain multiple\\xa0rules; then\\xa0each rule\\xa0defines the\\xa0triggers that,\\xa0if\\xa0conditions are met,\\xa0start\\xa0one or more actions.\\n\\n\\nSee\\xa0Manage workflows to automate tasks for best practices when adding workflows.\\n\\nBuilding rules in Workflow\\nA workflow is defined in a step-by-step process:\\n\\n\\nAdd a workflow\\xa0as a container that will hold\\xa0a set of related rules.\\n\\n\\nStart to build your rule -\\xa0add\\xa0a rule description to your workflow.\\n\\n\\nAdd triggers with conditions to the rule, based on:\\n\\niSheet records\\nFiles\\nTasks\\nDates\\n\\nSchedule\\n\\n\\n\\n\\nAdd actions to the rule (each article below describes\\xa0a single type of action):\\n\\nAdd a folder and sub-folders\\nMove / copy / delete a file\\nAutomatically send emails\\nAdd tasks and sub-tasks\\nChange a task assignee\\nAdd events\\nUpdate iSheet columns\\xa0(choice, date, user lookup, single-line text and multi-line text)\\nAdd\\xa0iSheet record\\nUpdate file metadata\\nGenerate document\\n\\nSend for approval (send a file)\\n\\n\\n\\n\\nActivate both\\xa0the workflow and your rules:\\n\\nOpen the Rule builder\\xa0screen and click More actions\\xa0for your\\xa0workflow description, select\\xa0Activate\\xa0to change the status of a\\xa0Draft\\xa0workflow to\\xa0Active.\\nEach rule must also be activated -\\xa0open the rule\\xa0then click\\xa0More actions\\xa0for each\\xa0rule that is needed\\xa0and select\\xa0Activate.\\n\\n\\n\\n\\xa0\\nWorkflow audit history\\nThe Workflow history audit\\xa0allows you to search through historical workflow activity and also test workflow rules without searching for the automated outputs.\\n';
        const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
        const client = new OpenAIClient("https://eastus-highq-lab-openai.openai.azure.com", new AzureKeyCredential("83cc6862e1c9464dbec0c9a814593780"));
        await client.getEmbeddings('text-embedding-ada-002', [searchText1]).then(async (res) => {
            // console.log(res.data[0].embedding);
            var embeddedData = res.data[0].embedding;
            fs.writeFile('documents/searchtext5.text', embeddedData.toString(), function () { });
            console.log(embeddedData);
        });


        await client.getEmbeddings('text-embedding-ada-002', [searchText2]).then(async (res) => {
            // console.log(res.data[0].embedding);
            var embeddedData = res.data[0].embedding;
            fs.writeFile('documents/searchtext1.text', embeddedData.toString(), function () { });
            console.log(embeddedData);
        });


        await client.getEmbeddings('text-embedding-ada-002', [searchText3]).then(async (res) => {
            // console.log(res.data[0].embedding);
            var embeddedData = res.data[0].embedding;
            fs.writeFile('documents/searchtext2.text', embeddedData.toString(), function () { });
            console.log(embeddedData);
        });


        await client.getEmbeddings('text-embedding-ada-002', [searchText4]).then(async (res) => {
            // console.log(res.data[0].embedding);
            var embeddedData = res.data[0].embedding;
            fs.writeFile('documents/searchtext3.text', embeddedData.toString(), function () { });
            console.log(embeddedData);
        });


        await client.getEmbeddings('text-embedding-ada-002', [searchText5]).then(async (res) => {
            // console.log(res.data[0].embedding);
            var embeddedData = res.data[0].embedding;
            fs.writeFile('documents/searchtext4.text', embeddedData.toString(), function () { });
            console.log(embeddedData);
        });
    } catch (error) {
        console.error(error);
    }
}

async function getCompletionData(content){
    try{
        const {OpenAIClient, AzureKeyCredential} = require("@azure/openai");
        const client = new OpenAIClient("https://eastus-highq-lab-openai.openai.azure.com", new AzureKeyCredential("83cc6862e1c9464dbec0c9a814593780"));
        var text = [  {
            content:  content,
            role: 'assistant'
          }];
        const { choices } = await client.getChatCompletions('gpt-35-turbo-base', text);
        console.log(choices);
        return choices;
    }
    catch(error)
    {
        console.log(error);
    }

}

module.exports = router;