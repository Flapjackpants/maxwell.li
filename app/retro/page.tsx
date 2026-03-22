import type { Metadata } from "next";
import Link from "next/link";
import styles from "./retro.module.css";
import {
  homeCv,
  homeFooter,
  homeHero,
  homeProjectsIntro,
  navLinks,
  PROFILE_IMAGE_URL,
} from "@/lib/home-content";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "~*~ Maxwell Li's Homepage ~*~",
  description: "Welcome to my cool web site!!!",
};

/** Classic hotlink-friendly GIFs for that Geocities energy. */
const Y2K_GIFS = {
  construction:
    "https://media2.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif?w=120",
  fire: "https://media4.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif?w=200",
  stars: "https://media1.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif?w=300",
  email: "https://media0.giphy.com/media/13CoXDiaCcCoyk/giphy.gif?w=80",
  new: "https://media3.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif?w=48",
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
      <center>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Y2K_GIFS.stars} alt="" width={280} height={40} />
        <h1 style={{ color: "#ff00ff", textShadow: "3px 3px #00ffff" }}>
          <span className={styles.blink}>*~ Welcome 2 My Portfolio ~*</span>
        </h1>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            You are visitor number 0000007 !!! Thanks 4 stopping by !!!
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Y2K_GIFS.fire} alt="" width={200} height={36} />
      </center>

      <p style={{ textAlign: "center" }}>
        <Link href="/" style={{ ...linkStyle, fontSize: "18px" }}>
          &lt;&lt; BACK 2 THE FUTURE (normal site)
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
                  alt="Me!!!"
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
