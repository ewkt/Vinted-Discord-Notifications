git filter-branch  HEAD~10..HEAD -f --env-filter "
export GIT_COMMITTER_NAME='ewkt' \
export GIT_COMMITTER_EMAIL='117741458+ewkt@users.noreply.github.com' \
export GIT_AUTHOR_NAME='ewkt' \
export GIT_AUTHOR_EMAIL='117741458+ewkt@users.noreply.github.com'"