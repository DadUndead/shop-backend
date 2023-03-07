export default {
  type: "object",
  properties: {
    title: {
      "type": "string"
    },
    description: {
      "type": "string"
    },
    price: {
      "type": "number"
    },
    image_url: {
      "type": "string"
    },
    count: {
      "type": "integer"
    }
  },
  required: [
    "title",
    "description",
    "price",
    "count"
  ]
} as const;