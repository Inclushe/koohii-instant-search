# Koohii Search `but better`

## Done

- [x] Update favicon and title
- [x] autofocus
- [x] Keyword search
  - [x] Multiple keyword search
  - [x] Frame number search
- [x] Investigate error with searching 域
  - [x] when no story is found?
- [x] range search showing as strange
  - [x] Update keyword search algo to use startsWith instead of includes
- [x] Redo search algo
  - "hair on the head"
  - Implement prepopulate algorithm in XState
  - https://stately.ai/registry/editor/3dff0b0d-9ad3-45c9-942a-a9e286e189b6?machineId=63edce10-3f32-4565-aeb5-4f90a3f283f3&mode=Design
  - Run in node first to test (bun test?)
    - https://bun.sh/docs/cli/test
    - Run in watch mode
  - {subQuery: "hair on the head", type: "keyword"}
- [x] Test every kanji and keyword (copy and paste from keywords.js)
- [x] Uploading stories
  - Have empty state using keywords-rtk-1.20230411b.js
  - Upload to local storage
  - Stories may not have all keywords, so merge stories with keywords-rtk-1.20230411b.js
- [x] Implement ?query= in URL
  - [x] useEffect
- [x] Parse curly braces
  - [x] Example: 贄
  - [x] Link to ?query=贄
- [x] Make keyword bold in story if not already `dev`
  - Ex. 給
- [x] Adjust algo to have `"` and `,` as terminators `dev`
- [x] Allow unicode references in frame number search `dev`
- [x] No nested bold tags `dev`
  - Ex. 岸
- [x] Fix gh issue
- [x] Add search icon `design`
- [x] Initial state `design`
- [x] Hide title on search `design`
- [x] Add notice saying all data stays local `design`

## Todo

- [x] Add slant
  - [ ] https://koohii-search.netlify.app/?query=%2520%25E9%2580%25B8%25E3%2582%258C%25E3%2582%258B
  - [ ] https://fonts.google.com/selection/embed
  - [ ] https://github.com/tailwindlabs/tailwindcss/discussions/3225#discussioncomment-1204105
- [x] Meta tags
- [x] Fade in initial screen
  - [x] Prevent flash on results when refreshing
- [ ] Add animation to exclamation mark
- [ ] Add links to Import section
- [x] Clear button on search bar
- [x] Fix bevel borders in Chrome/Safari
- [x] Empty state `design`
- [ ] Error state `design`
  - [ ] Show error for failed imports
- [ ] Dark mode `design`
- [ ] Google-style/Intellisense keyword autocomplete `design/dev`
  - [ ] Tab to complete
- [ ] Make stories upload drag and drop `design/dev`
  - [ ] https://www.npmjs.com/package/react-dropzone
- [-] Jisho and Koohii links `design`
- [x] Search and clear icons on search bar `design`
- [ ] Host from koohii.inclushe.com
- [ ] Improve copy
  - [ ] Readme
    - [ ] Emojis
    - [ ] Like https://github.com/lrorpilla/jidoujisho

## Backburner

- [ ] Options?
  - [ ] Custom fonts?
  - [ ] Handle uploading stories
- [ ] Grab alternate keywords `design/dev`
  - https://web.archive.org/web/20100511002740/http://www.tanos.co.uk/jlpt/jlpt1/kanji/
  - Only display alternate keywords, don't use in keyworks to kanji search
- [ ] Helper extension?
  - [ ] Automatically import stories
  - [ ] Add/edit/get user/popular stories?
- [ ] Clipboard watcher
  - [ ] https://github.com/themoeway/yomitan/blob/55897b2b29e88ffd0c9140d03b9e74c4a94d98bd/ext/js/comm/clipboard-reader.js#L64
  - [ ] Requires helper extension
