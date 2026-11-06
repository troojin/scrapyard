/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "bool2740443028",
    "name": "is_for_sale",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "number3402113753",
    "max": null,
    "min": 0,
    "name": "price",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "file3166363787",
    "maxSelect": 1,
    "maxSize": 104857600,
    "mimeTypes": [
      "application/zip",
      "application/x-zip-compressed",
      "application/octet-stream"
    ],
    "name": "archive_file",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "json1052915378",
    "maxSize": 0,
    "name": "file_tree",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "help": "",
    "hidden": false,
    "id": "bool2563956121",
    "name": "sold",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "exceptDomains": [],
    "help": "",
    "hidden": false,
    "id": "url2423711359",
    "name": "github_url",
    "onlyDomains": [],
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // remove field
  collection.fields.removeById("bool2740443028")

  // remove field
  collection.fields.removeById("number3402113753")

  // remove field
  collection.fields.removeById("file3166363787")

  // remove field
  collection.fields.removeById("json1052915378")

  // remove field
  collection.fields.removeById("bool2563956121")

  // update field
  collection.fields.addAt(2, new Field({
    "exceptDomains": [],
    "help": "",
    "hidden": false,
    "id": "url2423711359",
    "name": "github_url",
    "onlyDomains": [],
    "presentable": false,
    "required": true,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
})
