import type { Metadata } from "next";
import Link from "next/link";
import styles from "./retro.module.css";
import {
  homeAboutBlocks,
  homeAboutSection,
  homeCv,
  homeFooter,
  homeHero,
  homeProjectsIntro,
  navLinks,
  PROFILE_IMAGE_URL,
} from "@/lib/home-content";
import { PROJECTS } from "@/lib/projects";
import { RetroBackgroundAudio } from "./RetroBackgroundAudio";

export const metadata: Metadata = {
  title: "~*~ Maxwell Li's Homepage ~*~",
  description: "Welcome to my cool web site!!!",
};

/** Classic hotlink-friendly GIFs for that Geocities energy. */
const Y2K_GIFS = {
  construction:
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXlqbTc4cWxwbjhpZjVqOXlqOGI3N3AyanZvNWZ6dmcxdmRhcDl4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sRHbqh9mGK0jVSWgSw/giphy.gif",
  fire: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2x3bHlrZDMxa2JhMjBqM3J2dDYxcHFkN3BhenRjZ2dwejgzYm1vdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13mwsrXEUtSyZi/giphy.gif",
  stars: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWZpaDljcnVzM2ltaG9ta2NvcWFlMjh0cmo3eXdwMXpmeW8wbnF1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/q6ffIzlwHKEncy19b5/giphy.gif",
  email: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExenNxNHZ0aWhncm5nem8zMnYzMHNicnlwcjllNDMxNGEydGJrd3poeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/R4vIxmpGyMB5TVS1vh/giphy.gif",
  new: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc296YXIyNGdtaHR0dHZ0M3Q2cjJ0dXAyYXU1NXJvcGRpdzFsaGptbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/droMJlwA7bz2zQo4dB/giphy.gif",
} as const;

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  margin: 0,
  padding: "12px",
  fontFamily: '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
  backgroundColor: "#000080",
  backgroundImage:
    "repeating-linear-gradient(180deg, #000060 0px, #000080 2px, #0000a0 4px)",
  color: "#ffff00",
  fontSize: "15px",
};

const linkStyle: React.CSSProperties = {
  color: "#00ff00",
  fontWeight: "bold",
};

const tableBorder = { border: "3px ridge #ff00ff", backgroundColor: "#000033" };

export default function RetroHomePage() {
  const year = new Date().getFullYear();

  return (
    <div style={pageStyle}>
      <RetroBackgroundAudio />
      <center>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Y2K_GIFS.stars} alt="" width={280} height={40} />
        <h1 style={{ color: "#ff00ff", textShadow: "3px 3px #00ffff" }}>
          <span className={styles.blink}>*~ Welcome 2 My Portfolio ~*</span>
        </h1>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            You are visitor number 0000071 !!! Thanks 4 stopping by !!!
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          overflow: 'hidden', 
          justifyContent: 'center' 
        }}>
          {Array(20).fill(0).map((_, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- inline GIF strip
            <img 
              key={i} 
              src={Y2K_GIFS.fire} 
              alt="" 
              width={200} 
              height={36} 
              style={{ flexShrink: 0 }} 
            />
          ))}
        </div>
      </center>

      <p style={{ textAlign: "center" }}>
        <Link href="/" style={{ ...linkStyle, fontSize: "18px" }}>
          &lt;&lt; OVR LAND OF SQUING && SQUAGALOGMAZAG!
        </Link>
      </p>

      <hr
        style={{
          border: "none",
          borderTop: "4px dashed #ff0",
          margin: "16px 0",
        }}
      />

      <table width="100%" cellPadding={8} style={tableBorder}>
        <tbody>
          <tr>
            <td colSpan={2} align="center" style={{ backgroundColor: "#330066" }}>
              <b>:: NAVIGATION ::</b>
              <br />
              {navLinks.map((l, i) => (
                <span key={l.href}>
                  {i > 0 ? " ~ " : null}
                  <a href={l.href} style={linkStyle}>
                    {l.label}
                  </a>
                </span>
              ))}
            </td>
          </tr>
          <tr>
            <td
              id="bio"
              valign="top"
              width="35%"
              style={{ ...tableBorder, backgroundColor: "#001a4d" }}
            >
              <center>
                <b>*** BIO ***</b>
                <br />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PROFILE_IMAGE_URL}
                  alt="Maxwell Li"
                  width={160}
                  height={160}
                  style={{ border: "4px ridge gold" }}
                />
              </center>
            </td>
            <td valign="top" style={{ ...tableBorder, backgroundColor: "#000044" }}>
              <p style={{ color: "#0ff", fontSize: "12px" }}>{homeHero.eyebrow}</p>
              <h2 style={{ color: "#ff6600", margin: "4px 0" }}>{homeHero.title}</h2>
              <p>{homeHero.lede}</p>
              <p>
                <a href="#cv" style={linkStyle}>
                  <b>&gt;&gt; View my CV!!!</b>
                </a>{" "}
                <a
                  href={homeFooter.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  <b>GitHub</b>
                </a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <br />

      <div id="about" className={styles.retroAbout}>
        <div className="home-about-section-intro">
          <p className="mono-data home-about-eyebrow">{homeAboutSection.eyebrow}</p>
          <h2 className="home-section-heading home-about-heading">
            {homeAboutSection.heading}
          </h2>
        </div>

        <div className="home-about-blocks">
          {homeAboutBlocks.map((block, index) => (
            <div
              key={block.title}
              className={
                index % 2 === 1
                  ? "home-about-block home-about-block--reverse"
                  : "home-about-block"
              }
            >
              <div className="home-about-split">
                <div className="home-about-collage-wrap" aria-hidden="true">
                  <div className="home-about-collage-grid">
                    {block.imageRows.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="home-about-collage-row"
                        style={
                          {
                            "--about-row-n": row.length,
                          } as React.CSSProperties
                        }
                      >
                        {row.map((src, cellIndex) => (
                          // eslint-disable-next-line @next/next/no-img-element -- same intrinsic mosaic as main home
                          <img
                            key={`${rowIndex}-${cellIndex}-${src}`}
                            src={src}
                            alt=""
                            className="home-about-collage-img"
                            loading="lazy"
                            decoding="async"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="home-about-copy">
                  <h3 className="home-about-subheading">{block.title}</h3>
                  <p className="home-about-body">{block.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <br />

      <center>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Y2K_GIFS.construction} alt="Under construction" width={120} />
      </center>

      <h2 id="projects" style={{ color: "#ff00ff", textAlign: "center" }}>
        {homeProjectsIntro.heading}
      </h2>
      <p style={{ textAlign: "center" }}>{homeProjectsIntro.intro}</p>

      <table width="100%" cellPadding={6} style={tableBorder}>
        <tbody>
          {PROJECTS.map((project) => (
            <tr key={project.id}>
              <td width="140" valign="top" style={{ backgroundColor: "#111166" }}>
                <a href={`/projects/${project.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.imageUrl}
                    alt=""
                    width={120}
                    height={68}
                    style={{ border: "2px solid lime" }}
                  />
                </a>
              </td>
              <td valign="top" style={{ backgroundColor: "#0a0a44" }}>
                <a href={`/projects/${project.id}`} style={linkStyle}>
                  <b style={{ fontSize: "17px" }}>{project.title}</b>
                </a>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={Y2K_GIFS.new} alt="" width={36} height={14} />
                <p>{project.description}</p>
                <p>
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-block",
                        margin: "2px",
                        padding: "2px 6px",
                        background: "#222",
                        color: "#ff0",
                        border: "1px solid #f0f",
                        fontSize: "11px",
                        fontFamily: "monospace",
                      }}
                    >
                      [{tag}]
                    </span>
                  ))}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <table width="100%" cellPadding={10} style={tableBorder} id="cv">
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#003300" }}>
              <h2 style={{ color: "#00ff99" }}>{homeCv.heading}</h2>
              <p>{homeCv.lede}</p>
              <center>
                <a
                  href={homeCv.pdfHref}
                  style={{
                    ...linkStyle,
                    fontSize: "20px",
                    background: "#ff0",
                    color: "#000080",
                    padding: "6px 12px",
                    border: "3px outset #fff",
                    display: "inline-block",
                  }}
                >
                  [ DOWNLOAD CV .PDF ]
                </a>
              </center>
            </td>
          </tr>
        </tbody>
      </table>

      <br />

      <hr style={{ borderTop: "6px double #f0f" }} />

      <table width="100%" cellPadding={8} style={tableBorder} id="socials">
        <tbody>
          <tr>
            <td align="center" style={{ backgroundColor: "#440044" }}>
              <p style={{ color: "#ffccff" }}>{homeFooter.connectLabel}</p>
              <p>{homeFooter.copy}</p>
              <p>
                <a
                  href={homeFooter.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  LinkedIn
                </a>
                {" | "}
                <a
                  href={homeFooter.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  GitHub
                </a>
                {" | "}
                <a href={homeFooter.mailHref} style={linkStyle}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={Y2K_GIFS.email}
                    alt="Email me"
                    width={48}
                    height={48}
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  E-MAIL!!!
                </a>
              </p>
              <p style={{ fontSize: "11px", color: "#aaa" }}>
                © {year} — All rights reserved (no stealing my HTML)
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <center style={{ marginTop: 12 }}>
        <p style={{ fontSize: "10px", color: "#666" }}>
          Best viewed in Netscape Navigator 4.7 at 800×600
        </p>
      </center>
    </div>
  );
}
