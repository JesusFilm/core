#!/bin/bash

# this script is used by GitHub actions to generate the comment body
# for preview deployment URLs. The comment template is located at:
# .github/deploy_preview_comment_template.md

function generate_row_for_project() {
    if [ -f "$2" ]; then
        echo "deployment-exists=true" >>$GITHUB_OUTPUT
        echo "deployment-url=$(cat $2)" >>$GITHUB_OUTPUT
        echo "| **$1** | ✅ Ready | [Visit Preview]($(cat $2)) | $(date -u) |" >>./.github/deployment_comment.md
    else
        echo "deployment-exists=false" >>$GITHUB_OUTPUT
        echo "| **$1** | ⬜️ Ignored | | $(date -u) |" >>./.github/deployment_comment.md
    fi
}

cp ./.github/deployment_comment_template.md ./.github/deployment_comment.md
generate_row_for_project $APP "apps/$APP/.vercel-url"
