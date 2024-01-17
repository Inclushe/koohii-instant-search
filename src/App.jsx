import React from 'react'
import myStoriesCSV from './assets/my_stories.csv?raw'

// replace all newlines inside quotes with a placeholder <br>
function replaceNewlinesInsideQuotes(str) {
  const regex = /("[\s|\S]*?")/gm;
  return str.replace(regex, (match) => {
    return match.replace(/(\r\n|\r|\n)/gm, "<br>")
  })
}

function parseStoriesCSV(csv) {
  const lines = csv.split('\n')
  const entries = {}
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) {
      continue
    }
    console.log(line)
    let [framenr, kanji, keyword, public_status, last_edited, ...storyParts] = line.split(',')

    const quotesRegex = /^"(.*)"$/gm;
    const quoteEscapeRegex = /""/gm;
    const boldRegex = /#(.*?)#/gm;
    const italicRegex = /\*(.*?)\*/gm;
    keyword = keyword.replace(quotesRegex, "$1");
    let story = storyParts.join(',')
    if (story) {
      story = story.replace(quotesRegex, "$1");
      story = story.replace(quoteEscapeRegex, '"');
      story = story.replace(boldRegex, "<b>$1</b>");
      story = story.replace(keyword, `<b>${keyword}</b>`);
      story = story.replace(italicRegex, "<i>$1</i>");
    }
    entries[kanji] = [framenr, kanji, keyword, public_status, last_edited, story]
  }
  return entries
}


function App() {
  const [searchTerm, setSearchTerm] = React.useState('漢字検索は簡単！')
  const [stories, setStories] = React.useState({})

  React.useEffect(() => {
    setStories(parseStoriesCSV(replaceNewlinesInsideQuotes(myStoriesCSV)))
    return () => {}
  }, [])

  return (
    <>
    <div className='w-full h-1 bg-orange-950'></div>
    <div className="p-4 mx-auto max-w-2xl text-orange-950">
      <h1 className="text-xl mb-4 font-bold">Koohii Instant Search</h1>
      <input className="border border-orange-950 rounded mb-4 p-2 w-full" type="text" name="searchTerm" value={searchTerm} onChange={(event) => {setSearchTerm(event.target.value)}} />
      <div>{searchTerm.split('').map((kanji) => {
        if (kanji in stories) {
          const frameNumber = stories[kanji][0]
          const kanjiCharacter = stories[kanji][1]
          const keyword = stories[kanji][2]
          const story = stories[kanji][5]
          return (
            <div className="bg-white mb-4 rounded shadow-md px-6 py-4 flex gap-4 sm:gap-6 text-orange-950 group" key={frameNumber}>
              <div className="flex flex-col justify-start items-stretch gap-2 py-1 text-center">
                <a href={`https://kanji.koohii.com/study/kanji/${frameNumber}`} target="_blank" rel="noreferrer" className="text-orange-950/60 text-sm group-hover:underline">{frameNumber}</a>
                <div className="text-4xl sm:text-6xl font-serif">{kanjiCharacter}</div>
              </div>
              <div className='flex-grow'>
                <div className="text-2xl font-serif mb-2">{keyword}</div>
                <div dangerouslySetInnerHTML={{__html: story}}></div>
              </div>
            </div>
          );
        }
      })}</div>
    </div>
    </>
  )
}

export default App
