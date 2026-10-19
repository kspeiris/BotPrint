export function generateSeleniumScript(c) {
 const q=s=>JSON.stringify(s), baseUrl=c.targetUrl.trim();
 let url=baseUrl; if(c.collectorUrl && /^https:\/\/script\.google\.com\/macros\/s\//.test(c.collectorUrl.trim())) { const join=url.includes('?')?'&':'?'; url += join+'botprintCollector='+encodeURIComponent(c.collectorUrl.trim()); }
 if(!/^https?:\/\//i.test(url)) throw new Error('Target URL must start with http:// or https://');
 const n=Math.max(1,Math.min(5,Number(c.botCount)||5)), runs=Math.max(1,Math.min(30,Number(c.loopCount)||1));
 return `# BotPrint controlled Selenium data collection. Use only your own/approved site.
# One-time setup: bash setup.sh | Run: bash run.sh
import time, random, uuid, concurrent.futures
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
URL=${q(url)}
PROFILE=${q(c.botType)}
BOTS=${n}
RUNS=${runs}
DELAY=${Math.max(0,Math.min(5000,Number(c.delayMs)||400))}/1000
HEADLESS=${c.headless?'True':'False'}
GROUP='coord-'+uuid.uuid4().hex[:10]
def pause(): time.sleep(random.uniform(.15,.45) if PROFILE=='RandomBot' else random.uniform(.25,.7) if PROFILE=='MimicBot' else random.uniform(.1,.3))
def driver():
    o=webdriver.ChromeOptions()
    if HEADLESS: o.add_argument('--headless=new')
    o.add_argument('--window-size=1365,900'); o.add_argument('--disable-notifications')
    return webdriver.Chrome(options=o)
def set_context(d,bid):
    d.execute_script("window.BOTPRINT_TEST_CONTEXT={userType:'Bot',botType:arguments[0],sessionSource:'Selenium',botId:arguments[1],coordinationGroupId:arguments[2]};",PROFILE,bid,GROUP)
def click_text(d, text):
    for e in d.find_elements(By.CSS_SELECTOR,'button,[role=button],a'):
        try:
            if e.is_displayed() and text.lower() in (e.text or '').lower(): e.click(); return True
        except Exception: pass
    return False
def workflow(d,bid):
    d.get(URL); WebDriverWait(d,20).until(EC.presence_of_element_located((By.TAG_NAME,'body'))); set_context(d,bid); pause()
    # Open the human collection page, then start its tracker so bot events enter the same collector.
    click_text(d,'Human collection'); pause()
    if click_text(d,'Start human collection'): pause()
    elif click_text(d,'Start collection'): pause()
    set_context(d,bid)
    # Interact with the same safe demo form shown to human participants.
    try:
        form=WebDriverWait(d,12).until(EC.presence_of_element_located((By.ID,'botprint-research-form')))
        d.execute_script("arguments[0].scrollIntoView({block:'center'});",form); pause()
        fields=[('input[name="displayName"]',f'Research Test {bid[-4:]}'),('input[name="email"]',f'{bid[-4:]}@example.test'),('textarea[name="comments"]','Controlled Selenium research interaction')]
        for selector,value in fields:
            try:
                e=form.find_element(By.CSS_SELECTOR,selector); e.click(); pause(); e.clear()
                for ch in value: e.send_keys(ch); time.sleep(random.uniform(.015,.06) if PROFILE=='MimicBot' else .005)
            except Exception as ex: print(bid,'field skipped',selector,str(ex)[:100])
        try: Select(form.find_element(By.NAME,'topic')).select_by_value(random.choice(['web','mobile','coordination']))
        except Exception: pass
        try:
            checkbox=form.find_element(By.NAME,'consentDemo')
            if not checkbox.is_selected(): checkbox.click()
        except Exception: pass
        # Scrolling and pointer movement generate the same tracker events as human sessions.
        for _ in range(4):
            d.execute_script('window.scrollBy({top:arguments[0],behavior:"instant"})',random.choice([140,220,-80])); pause()
        set_context(d,bid)
        form.find_element(By.CSS_SELECTOR,'button[type="submit"]').click(); pause()
        print(bid,'demo form interaction completed')
    except Exception as ex:
        print(bid,'form not found; check target URL and app build:',str(ex)[:240])
    time.sleep(DELAY)
def worker(i):
    bid=f'bot-{i+1:02d}-'+uuid.uuid4().hex[:6]; d=driver()
    try:
        for run in range(RUNS): print('Starting',bid,'run',run+1,'/',RUNS); workflow(d,bid)
    finally: d.quit()
    return bid
if __name__=='__main__':
    print('BotPrint coordinated test:',BOTS,'visible/hidden browsers; group',GROUP); print('Target:',URL)
    with concurrent.futures.ThreadPoolExecutor(max_workers=BOTS) as pool:
        fs=[pool.submit(worker,i) for i in range(BOTS)]
        for f in concurrent.futures.as_completed(fs):
            try: print('Finished',f.result())
            except Exception as e: print('Worker error:',repr(e))
`;
}
