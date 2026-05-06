import time
import random
import platform
import os
import sys
from datetime import datetime

# ────────────────[ معلومات النظام ]────────────────
def system_info():
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("🖥️ SYSTEM INFO")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📟 System: {platform.system()}")
    print(f"🧠 Node: {platform.node()}")
    print(f"⚙️ Release: {platform.release()}")
    print(f"🐍 Python Version: {platform.python_version()}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


# ────────────────[ محاكاة سرعة ]────────────────
def speed_test():
    print("⚡ SPEED TEST STARTING...\n")
    
    start = time.time()
    
    # محاكاة عمليات ثقيلة
    for i in range(1, 101):
        _ = i * random.randint(1, 100)
        time.sleep(0.01)

    end = time.time()
    speed = round(end - start, 3)

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("⚡ SPEED RESULT")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"⏱️ Time Taken: {speed} sec")

    if speed < 1:
        print("🚀 Status: FAST")
    elif speed < 2:
        print("⚡ Status: NORMAL")
    else:
        print("🐢 Status: SLOW")

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


# ────────────────[ ساعة مباشرة ]────────────────
def live_clock(seconds=10):
    print("🕒 LIVE CLOCK")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    for _ in range(seconds):
        now = datetime.now().strftime("%H:%M:%S")
        print(f"⏰ Current Time: {now}")
        time.sleep(1)

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


# ────────────────[ لعبة بسيطة ]────────────────
def mini_game():
    print("🎮 MINI GAME: GUESS NUMBER")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    number = random.randint(1, 10)
    guess = None

    while guess != number:
        try:
            guess = int(input("🔢 Guess a number (1-10): "))
            if guess < number:
                print("📉 Too low!\n")
            elif guess > number:
                print("📈 Too high!\n")
        except:
            print("❌ Enter a valid number!")

    print("🎉 Correct! You won!\n")


# ────────────────[ تنظيف الشاشة ]────────────────
def clear():
    os.system('cls' if os.name == 'nt' else 'clear')


# ────────────────[ القائمة الرئيسية ]────────────────
def menu():
    while True:
        print("""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        🐍 SPEED PY MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ System Info
2️⃣ Speed Test
3️⃣ Live Clock
4️⃣ Mini Game
5️⃣ Exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")

        choice = input("👉 Choose option: ")

        clear()

        if choice == "1":
            system_info()
        elif choice == "2":
            speed_test()
        elif choice == "3":
            live_clock()
        elif choice == "4":
            mini_game()
        elif choice == "5":
            print("👋 Bye Bye!")
            sys.exit()
        else:
            print("❌ Invalid choice!\n")


# ────────────────[ تشغيل البرنامج ]────────────────
if __name__ == "__main__":
    clear()
    print("🔥 Welcome to Speed.py Playground\n")
    menu()
    
    
    # ملحوظة الملف دا ما عندو اي علاقة بالبوت ولكن حبيت اكتبو بس من باب تحدي النفس لاني زمان ما تعاملت مع لغة بايثون وحسيت اني صرت ضعيف فيها رغم سهولتها 
    
    # يمديك تحذف الملف لو بدك ولو بدك تخليه لان وجودو من عدمو ولا شيء