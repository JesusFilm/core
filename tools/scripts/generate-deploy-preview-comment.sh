#!/bin/bash

# this script is used by GitHub actions to generate the comment body
# for preview deployment URLs. The comment template is located at:
# .github/deploy_preview_comment_template.md

function generate_row_for_project() {
    if [ -f "$2" ]; then
        echo "| **$1** | ✅ Ready | [Visit Preview]($(cat $2)) |" >>./.github/deploy_preview_comment.md
    else
        echo "| **$1** | ⬜️ Ignored | |" >>./.github/deploy_preview_comment.md
    fi
}

cp ./.github/deploy_preview_comment_template.md ./.github/deploy_preview_comment.md
generate_row_for_project "docs" "apps/docs/.vercel/url.txt"
generate_row_for_project "journeys" "apps/journeys/.vercel/url.txt"
generate_row_for_project "journeys-admin" "apps/journeys-admin/.vercel/url.txt"
generate_row_for_project "watch" "apps/watch/.vercel/url.txt"
