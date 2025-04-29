import {pgTable,text,integer,boolean,uuid, timestamp} from 'drizzle-orm/pg-core'
import { relations, Relations } from 'drizzle-orm'

export const files = pgTable("files",{
    id: uuid("id").defaultRandom().primaryKey(),
    
    //basic file/folder information
    name: text("name").notNull(),
    path: text("path").notNull(),//eg:  /document/project/resume.pdf
    size: integer("size").notNull(),
    type: text("type").notNull(), //stores : file("jpg","pdf"...) or folder("folder")

    //storage information
    fileUrl: text("file_url").notNull(), // url to access file
    thumbnailUrl: text("thumbnail_url"),

    //ownership
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id"), //parent folder ID (null for root items)

    //file/folder flags
    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    //TimeStamp
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updayedAt: timestamp("updated_at").defaultNow().notNull(),

})

export const fileRelations = relations(files,({one,many})=> ({
    parent: one(files,{
        fields: [files.parentId],
        references: [files.id],
    }),
    children: many(files),
}))

//Type defination
export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferSelect;