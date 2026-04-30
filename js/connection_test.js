import 'dotenv/config'
import { Client } from "@notionhq/client"
import { resolve } from 'node:dns'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const response = await notion.dataSources.query({
  data_source_id: process.env.NOTION_DATABASE_ID,
  filter: {
    property: "Published",
    checkbox: { equals: true }
  }
})

console.log(response.results)