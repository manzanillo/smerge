import "./Layout.css"

function Layout() {

  return (
    <nav>
        <a href="/" className="logo">
            SMERGE
        </a>
        <ul>
            <div className="navlinks">
                <li><a href="/howto/">How To Smerge</a> </li>
                <li><a href="/impressum/">Impressum</a> </li>
                <li><a onClick={() => window.history.back()}>Back</a> </li>
            </div>
        </ul>
    </nav>

  )
}

export default Layout