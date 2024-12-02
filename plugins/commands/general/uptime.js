const config = {
    name: "uptime",
    aliases: ["upt"],
    credits: "Frank kaumba"
}

function onCall({ message, args }) {
    const startTime = global.client.startTimestamp || Date.now();
    const uptime = global.msToHMS(process.uptime() * 1000);
    const systemUptime = process.uptime();
    
    const uptimeDetails = ` 
       𝙋𝙍𝙄𝙈𝙀 𝚂𝚈𝚂𝚃𝚈𝙴𝙼 𝙸𝙽𝙵𝙾       

   📅 Launch Date: ${new Date(startTime).toLocaleString()}
   ⏱️ Bot Uptime: ${uptime}
   💻 System Uptime: ${formatSystemUptime(systemUptime)}
   🚀 Performance: ${getPerformanceEmoji(systemUptime)}

${getUptimeInsights(systemUptime)}`;

    
    if (args[0] === 'detailed') {
        uptimeDetails += `
🔧 Additional System Info:
   💾 Memory Usage: ${formatMemoryUsage()}
   🖥️ CPU Load: ${formatCPULoad()}`;
    }

    message.reply(uptimeDetails);
}


function formatSystemUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function getPerformanceEmoji(uptime) {
    if (uptime < 3600) return '🟢 Freshly Started';
    if (uptime < 86400) return '🟡 Stable';
    return '🟢 Rock Solid';
}

function getUptimeInsights(seconds) {
    const insights = [
        '✨ Smooth operations, no interruptions!',
        '🌟 Maintaining peak performance!',
        '💪 Resilience is our middle name!'
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
}

function formatMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const memoryInMB = (memoryUsage.rss / (1024 * 1024)).toFixed(2);
    return `${memoryInMB} MB`;
}

function formatCPULoad() {
    return 'Calculating...';
}

export default {
    config,
    onCall
}
