project_name: "viz-collapsible_tree-marketplace"

constant: VIS_LABEL {
  value: "Collapsible Tree"
  export: override_optional
}

constant: VIS_ID {
  value: "collapsible_tree-marketplace"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  url: "https://static-a.cdn.looker.app/marketplace/viz-dist/collapsible_tree.js"
  label: "@{VIS_LABEL}"
}
