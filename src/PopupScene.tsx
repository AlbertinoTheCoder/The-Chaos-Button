import { playSfx } from './sound';
import { useEffect, useState } from 'react';
import { popupModes, popupNames } from './popups';
export function PopupScene({ id, close }: { id: number; close: () => void }) {
  const index = id - 271,
    mode = popupModes[index];
  const [step, setStep] = useState(0),
    [tick, setTick] = useState(0),
    [checked, setChecked] = useState<number[]>([]),
    [answer, setAnswer] = useState('');
  useEffect(() => {
    const t = setInterval(() => setTick((s) => s + 1), 900);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (answer) playSfx(mode === 'error' ? 'error' : 'notification', { intensity: 0.6 });
  }, [answer, mode]);
  useEffect(() => {
    if (mode === 'chat' && tick < 6 && tick > 0) playSfx('notification', { intensity: 0.35 });
    if (mode === 'update' && tick > 0 && tick < 6) playSfx('tick', { intensity: 0.35 });
  }, [tick, mode]);
  const actions = (labels: string[]) =>
    labels.map((label, i) => (
      <button
        key={label}
        onClick={() => {
          setStep((s) => s + 1);
          setAnswer(
            [
              'Request denied successfully.',
              'Your objection has been forwarded to nobody.',
              'Thank you. This changes absolutely nothing.',
            ][i % 3],
          );
        }}
      >
        {label}
      </button>
    ));
  return (
    <section
      className={'absurd-popup popup-' + mode}
      style={{ left: 8 + (index % 4) * 17 + '%', top: 14 + (index % 3) * 13 + '%' }}
    >
      <div className="windowbar">
        <span>
          {mode === 'news'
            ? 'CBN / CHAOS BROADCAST NETWORK'
            : mode === 'chat'
              ? 'BUTTONS_ONLY / 4 MEMBERS'
              : 'NONSENSE OS / UNSOLICITED NOTICE'}
        </span>
        <button aria-label="Dismiss popup" onClick={close}>
          ✕
        </button>
      </div>
      <div className="popup-body">
        <span className="popup-emblem">
          {
            {
              subscription: '⌛',
              error: '!',
              news: '◉',
              notification: '✉',
              newsletter: '✎',
              permission: '⚿',
              chat: '☏',
              invoice: '$',
              survey: '★',
              update: '↻',
              terms: '§',
              meeting: '☕',
            }[mode]
          }
        </span>
        <h2>{popupNames[index]}</h2>
        {mode === 'subscription' ? (
          <>
            <p>Your free trial of good judgment ended {tick} seconds ago.</p>
            <div className="popup-plan">
              <strong>$0.00</strong>
              <span>/ forever, allegedly</span>
              <ul>
                <li>Unlimited terrible ideas</li>
                <li>No common sense included</li>
                <li>Cancel whenever we feel like it</li>
              </ul>
            </div>
            <div className="popup-actions">
              {actions(['Renew my regrets', 'Continue being a problem'])}
            </div>
          </>
        ) : mode === 'error' ? (
          <>
            <p>The previous error could not be displayed because another error was using it.</p>
            <code>ERR_SUCCESSFULLY_UNSUCCESSFUL_{404 + step}</code>
            <div className="popup-actions">{actions(['Fix it worse', 'Blame the button'])}</div>
            {Array.from({ length: Math.min(step, 4) }, (_, n) => (
              <div className="nested-error" key={n}>
                ⚠ ERROR {n + 1}: Your solution created a department.
              </div>
            ))}
          </>
        ) : mode === 'news' ? (
          <>
            <div className="news-anchor">
              <span>♟</span>
              <div>
                <b>LIVE</b>
                <strong>
                  {
                    [
                      '“We told them not to press it.”',
                      '“Nobody could have seen this coming.”',
                      '“The button has retained legal counsel.”',
                      '“Experts recommend literally anything else.”',
                    ][tick % 4]
                  }
                </strong>
              </div>
            </div>
            <div className="news-ticker">
              <span>
                BREAKING · LOCAL HUMAN STILL CLICKING · REALITY REQUESTS PERSONAL SPACE · BUTTON
                STOCKS IN FREEFALL ·{' '}
              </span>
            </div>
            <button className="popup-dismiss" onClick={close}>
              Turn off the news
            </button>
          </>
        ) : mode === 'notification' ? (
          <>
            <p>
              {index === 6
                ? 'Your smart refrigerator would like you to know that it is disappointed.'
                : 'Future you says: “It gets worse. Also, buy milk.”'}
            </p>
            <div className="notification-preview">
              <b>{index === 6 ? 'FRIDGE_192.168.NOPE' : 'YOU (BUT MORE TIRED)'}</b>
              <span>
                {tick % 2
                  ? 'Seen. Emotionally unprocessed.'
                  : 'Typing a deeply unnecessary follow-up…'}
              </span>
            </div>
            <div className="popup-actions">
              {actions(['Mark as a personal attack', 'Remind me yesterday'])}
            </div>
          </>
        ) : mode === 'newsletter' ? (
          <>
            <p>Join 0 other sensible people receiving weekly threats from this button.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAnswer('Subscribed to absolutely nothing. This address stays on this page.');
                setStep(1);
              }}
            >
              <input
                aria-label="Fictional newsletter address"
                type="text"
                placeholder="regrets@example.void"
              />
              <button>{step ? 'SUBSCRIBE AGAIN, APPARENTLY' : 'SIGN ME UP FOR TROUBLE'}</button>
            </form>
            <small>No emails are sent. We barely know how buttons work.</small>
          </>
        ) : mode === 'permission' ? (
          <>
            <p>This webpage would like permission to:</p>
            <div className="permission-list">
              {[
                'Develop an attitude',
                'Judge your life choices',
                'Rearrange fictional furniture',
                'Ignore its own warning labels',
              ].map((label, n) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    checked={checked.includes(n)}
                    onChange={() =>
                      setChecked((s) => (s.includes(n) ? s.filter((i) => i !== n) : [...s, n]))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="popup-actions">
              <button
                onClick={() =>
                  setAnswer(
                    checked.length +
                      ' imaginary permissions granted. Your actual device is untouched.',
                  )
                }
              >
                Allow selected nonsense
              </button>
              <button onClick={close}>Deny with confidence</button>
            </div>
          </>
        ) : mode === 'chat' ? (
          <div className="fake-chat">
            {[
              'RED BUTTON: is the human still here?',
              'SMALL BUTTON: unfortunately yes',
              'LEGAL BUTTON: do not make eye contact',
              'RED BUTTON: they are reading this, aren’t they?',
              'SMALL BUTTON: act like a normal website',
              'LEGAL BUTTON: too late.',
            ]
              .slice(0, Math.min(6, tick + 1))
              .map((line, n) => (
                <div className={n % 2 ? 'chat-right' : ''} key={line}>
                  <small>{line.split(':')[0]}</small>
                  <p>{line.split(':')[1]}</p>
                </div>
              ))}
            <div className="popup-actions">
              {actions(['I can hear you, you know.', 'Send a deeply awkward wave'])}
            </div>
          </div>
        ) : mode === 'invoice' ? (
          <>
            <div className="invoice-lines">
              {[
                ['One innocent red button', '19.99'],
                ['Reality repair labor', '404.00'],
                ['Emotional support duck', '7.50'],
                ['Being annoying surcharge', String((step + 1) * 13)],
              ].map(([label, cost]) => (
                <div key={label}>
                  <span>{label}</span>
                  <b>{cost} ¤</b>
                </div>
              ))}
              <strong>TOTAL: {(431.49 + (step + 1) * 13).toFixed(2)} imaginary credits</strong>
            </div>
            <div className="popup-actions">
              <button
                onClick={() => {
                  setStep((s) => s + 1);
                  setAnswer('Late fee added. A fictional accountant cackles.');
                }}
              >
                Dispute charge (+13 ¤)
              </button>
              <button
                onClick={() => setAnswer('Paid with exposure. The accountant has blocked you.')}
              >
                Pay with exposure
              </button>
            </div>
          </>
        ) : mode === 'survey' ? (
          <>
            <p>On a scale from “WHY” to “OH NO”, how would you rate this experience?</p>
            <div className="survey-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  className={step >= n ? 'chosen' : ''}
                  key={n}
                  aria-label={'Rate ' + n + ' stars'}
                  onClick={() => {
                    setStep(n);
                    setAnswer(
                      [
                        'Your honesty has hurt our one employee.',
                        'We can do worse.',
                        'Aggressively average. We respect that.',
                        'You have unusual taste.',
                        'Your standards are our favorite thing about you.',
                      ][n - 1],
                    );
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <small>Your feedback goes directly into the void.</small>
          </>
        ) : mode === 'update' ? (
          <>
            <div className="loading-ring" />
            <progress max={100} value={Math.min(99, tick * 17 + step * 3)} />
            <p>
              {tick < 6
                ? 'Please keep the website plugged into the internet of bad ideas.'
                : '99% — installing the final 1% requires another final 1%.'}
            </p>
            <div className="popup-actions">
              <button
                onClick={() => {
                  setStep((s) => s + 1);
                  setAnswer('Restarting the progress bar emotionally. Not physically.');
                }}
              >
                Stare harder
              </button>
              <button onClick={close}>Postpone until the heat death of the universe</button>
            </div>
          </>
        ) : mode === 'terms' ? (
          <>
            <div className="tiny-terms" style={{ fontSize: Math.max(7, 12 - step) + 'px' }}>
              By continuing to exist near this button, you agree that pressing it was entirely your
              idea. The button assumes no responsibility for gravity, missing pixels, imaginary
              invoices, unsolicited ducks, or the increasingly specific feeling that you should be
              doing something else. All disputes shall be resolved by a committee of smaller
              buttons. Your statutory right to regret this remains unaffected.
            </div>
            <div className="popup-actions">
              <button
                onClick={() => {
                  setStep((s) => s + 1);
                  setAnswer('The fine print has become even finer.');
                }}
              >
                Read the finer print
              </button>
              <button onClick={close}>Accept the inevitability</button>
            </div>
          </>
        ) : (
          <>
            <p>Agenda: why you keep doing this.</p>
            <div className="meeting-guests">
              ♟ ♟ ♟ ♟
              <span>{['THE BUTTON', 'HR', 'A DUCK', 'YOU, PROBABLY'][tick % 4]} IS SPEAKING</span>
            </div>
            <div className="popup-actions">
              {actions([
                'This could have been an error message',
                'Pretend my microphone is broken',
              ])}
            </div>
          </>
        )}
        {answer && (
          <p className="popup-reply" role="status">
            {answer}
          </p>
        )}
      </div>
    </section>
  );
}
